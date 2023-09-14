// Read and parse bytecode into a chunktree

const ReaderClass = require('../Bytecode/reader.js')
const opdata = require('../Bytecode/opdata.json')
let ChunkDecode
function error(Str) {
    throw Str
}

function bits(d) {
    let a = (d >>> 0).toString(2)
    return `${(8 - a.length) <= 0 ? '' : ('0').repeat(8 - a.length)}${a}`
}

let ExpectingSetListData = false
function ReadInstructions(reader, ConstantReferences, usedInstrs) {
    let Instructions = []
    let InstLen = reader.gInt()
    for (let Idx = 0; Idx < InstLen; Idx++) {
        let [ A, B, C, D ] = reader.gAscii(4)
        let InstBin = `${bits(D)}${bits(C)}${bits(B)}${bits(A)}`
        let Opco = parseInt(InstBin.substr(26, 6), 2)
        let Type = opdata.Opcode[Opco]
        let Mode = opdata.Opmode[Opco]

        usedInstrs[Opco] = true
        let Inst = {
            Enum: Opco,
            Value: reader.gBits32from([A, B, C, D]),
            Type: Type,
            Mode: Mode,
            IsDataType: false,
            Name: opdata.Opnames[Opco],
            References: [],
            BackReferences: [],
            ['1']: parseInt(InstBin.substr(18, 8), 2),
            ['2']: null,
            ['3']: null
        }

        switch (Type) {
            case 'ABC':
                Inst['2'] = parseInt(InstBin.substr(0, 9), 2)
                Inst['3'] = parseInt(InstBin.substr(9, 9), 2)
                break
            case 'ABx':
                Inst['2'] = parseInt(InstBin.substr(0, 18), 2)
                break
            case 'AsBx':
                Inst['2'] = parseInt(InstBin.substr(0, 18), 2) - 131071
                break
            default: break
        }

        if (ExpectingSetListData === true) {
            ExpectingSetListData = false
            Inst.IsDataType = true
            Instructions[Idx] = Inst
            continue
        }

        // TEST, TESTSET
        if (Opco == 26 || Opco == 27) { 
            Inst['3'] = Inst['3'] == 0
        }

        // EQ, LT, LE
        if (Opco >= 23 && Opco <= 25) {
            Inst['1'] = Inst['1'] != 0
        }

        // SETLIST
        if (Opco == 34 && Inst['3'] === 0) {
            ExpectingSetListData = true
        }


        Instructions[Idx] = Inst
    }
    return Instructions
}

class nil { t = 'nil' };
function ReadConstants(reader, ConstantReferences) {
    let Constants = []
    let LConst = reader.gInt()
    for (let Idx = 0; Idx < LConst; Idx++) {
        let Type = reader.gBits8()
        let Cons = null
        switch (Type) {
            case 1:
                Cons = (reader.gBits8() != 0)
                break
            case 3:
                Cons = reader.gFloat()
                break
            case 4:
                let str = reader.gString()
                Cons = str.substr(0, str.length - 1)
                break
            default: 
                //Cons = nil
                Cons = null;
                break
        }

        let Refs = ConstantReferences[Idx]
        if (Refs) {
            for (let i = 0; i < Refs.length; i++) {
                Refs[i].Inst[Refs[i].Register] = Cons
            }
        }

        Constants.push(Cons)
    }

    return Constants
}

function ReadProtos(tree, reader, UsedInstructions) {
    let Protos = []
    let LProto = reader.gInt()
    for (let Idx = 0; Idx < LProto; Idx++) {
        Protos.push(ChunkDecode(tree, reader, UsedInstructions))
    }
    return Protos
}

function SetupReferences(chunk, inst) {
    let Reference
    switch (inst.Name) {
        case 'LOADK':
        case 'GETGLOBAL':
        case 'SETGLOBAL':
            // add constant references?
            break

        case 'JMP':
        case 'FORLOOP':
        case 'FORPREP':
            //console.log(inst['2'], chunk.Instr.indexOf(inst), chunk.Instr.indexOf(inst) + inst['2'] + 1 )
            Reference = chunk.Instr[ chunk.Instr.indexOf(inst) + inst['2'] + 1 ]
            inst.References[0] = Reference
            Reference.BackReferences.push(inst)
            break
        
        case 'EQ':
        case 'LT':
        case 'LE':
            // add constant references?

            Reference = chunk.Instr[ chunk.Instr.indexOf(inst) + chunk.Instr[chunk.Instr.indexOf(inst) + 1]['2'] + 1 + 1 ]
            inst.References[2] = Reference
            Reference.BackReferences.push(inst)

            inst.JumpTo = chunk.Instr[chunk.Instr.indexOf(inst) + 1]
            break

        case 'TEST':
        case 'TESTSET':
        case 'TFORLOOP':
            Reference = chunk.Instr[ chunk.Instr.indexOf(inst) + chunk.Instr[chunk.Instr.indexOf(this) + 1]['2'] + 1 + 1 ]
            inst.References[2] = Reference
            Reference.BackReferences.push(inst)
            break
        
        case 'GETTABLE':
        case 'SETTABLE':
        case 'ADD':
        case 'SUB':
        case 'MUL':
        case 'DIV':
        case 'MOD':
        case 'POW':
        case 'SELF':
            // add constant references?
            break
        
    }
}

ChunkDecode = function(tree, reader, insts = null) {
    let ConstantReferences = []
    let UsedInstructions = insts || {}

    let Chunk = {
        Tree: tree,
        Name: reader.gString(),
        FirstL: reader.gInt(),
        LastL: reader.gInt(),
        Upvals: reader.gBits8(),
        Args: reader.gBits8(),
        Vargs: reader.gBits8(),
        Stack: reader.gBits8(),
        Instr: null,
        Const: null,
        Proto: null,
        Lines: [],
        Locals: [],
        Upvalues: [],
        Virtuals: []
    }

    Chunk.Instr = ReadInstructions(reader, ConstantReferences, UsedInstructions)
    for (let i = 0; i < Chunk.Instr.length; i++)
        SetupReferences(Chunk, Chunk.Instr[i])

    Chunk.Const = ReadConstants(reader, ConstantReferences)
    Chunk.Proto = ReadProtos(tree, reader, UsedInstructions)

    tree.TotalInstructions = (tree.TotalInstructions || 0) + Chunk.Instr.length

    if (Chunk.Name) {
        Chunk.Name = Chunk.Name.substr(0, Chunk.Name.length - 1)
    }
    if (insts == null) {
        Chunk.UsedInstructions = UsedInstructions
    }

    do { // Debug data

        // Lines
        const LLine = reader.gInt()
        for (let Idx = 0; Idx < LLine; Idx++) {
            Chunk.Lines.push(reader.gInt())

        }

        // Locals
        const LLocal = reader.gInt()
        for (let i = 0; i < LLocal; i++) {
            Chunk.Locals.push({
                Name: reader.gString(),
                FirstL: reader.gInt(),
                LastL: reader.gInt()
            })
        }

        // Upvalues
        const LUpv = reader.gInt()
        for (let i = 0; i < LUpv; i++) {
            Chunk.Upvalues.push(reader.gString())
        }
    } while (false) 
    
    return Chunk
}

function generateString(length) {
    var result           = '';
    var characters       = '_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    result += characters.charAt(Math.floor(Math.random() * characters.length - 10));
    length--;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

function addOpcode(chunk, pos, name, opcode) {
    chunk.Tree.Chunk.UsedInstructions[name] = true
    if (chunk.Tree.Chunk.UsedInstructions != null)
        chunk.Tree.Chunk.UsedInstructions[name] = true;

    let ranName = chunk.Tree.Opmap[name] || null;
    if (ranName === null) {
        do {
            ranName = `x${generateString(8)}`
        } while (chunk.Tree.ROpmap[ranName])
    }
    opcode.Enum = ranName

    if (chunk.Tree.Opmap != null)
        chunk.Tree.Opmap[name] = ranName;
    if (chunk.Tree.ROpmap != null)
        chunk.Tree.ROpmap[ranName] = '' + name;

    opcode['1'] = opcode['1'] != undefined ? opcode['1'] : null
    opcode['2'] = opcode['2'] != undefined ? opcode['2'] : null
    opcode['3'] = opcode['3'] != undefined ? opcode['3'] : null
    opcode.References = []
    opcode.BackReferences = []
    opcode.IgnoreInstruction = true
    chunk.Instr.splice(pos, 0, opcode)
    return true;
}

module.exports = {
    DecodeBytestring: async function(byteString, settings) {
        console.log("BRUH,", byteString)
        const reader = new ReaderClass(byteString)

        if (settings.Debug) 
            console.log("Dumping headers")
        let Headers = {
            Signature: reader.gString(4),
            Version: reader.gBits8(),
            FormatVersion: reader.gBits8(),
            Endianness: reader.gBits8(),
            IntSize: reader.gBits8(),
            Sizet: reader.gBits8(),
            InstSize: reader.gBits8(),
            NumSize: reader.gBits8(),
            IntegralFlag: reader.gBits8(),
        }
    
        if (settings.Debug)
            console.log(`Setting gInt and gSizet, ${Headers.IntSize}, ${Headers.Sizet}`)

        if (Headers.IntSize === 4)
            reader.gInt = reader.gBits32
        else if(Headers.IntSize === 8) 
            reader.gInt = reader.gByte8
        else
            return error('Integer size not supported')

        if (Headers.Sizet === 4)
            reader.gSizet = reader.gBits32
        else if(Headers.Sizet === 8) 
            reader.gSizet = reader.gByte8
        else
            return error('Sizet size not supported')
        

        if (settings.Debug) 
            console.log("Dumping top chunk")
        let Tree = { Headers: Headers, Opmap: null, ROpmap: null, AddOpcode: addOpcode }
        Tree.Chunk = ChunkDecode(Tree, reader)
        Tree.nil = nil


        //console.log(Tree.Chunk)
        return Tree
    },
    Encoder: require('../Bytecode/encoder.js')
}
