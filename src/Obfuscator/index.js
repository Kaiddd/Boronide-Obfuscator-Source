
let opdata = require('../Bytecode/opdata.json')
let _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
// ?!@#$%&{}[]()§´^*'¨:.,;-_<abcdefghijklmnopqrstuvwxyz0123456789+/
// ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/
function shuffleString(str) {
    var a = str.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

function shuffleArray(array) {
    var currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}


function genChars(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    var charactersLength = characters.length;
    result += characters.charAt(Math.floor(Math.random() * characters.length - 10));
    length--;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}


function xorStrArr(bytes, key) {
    let result = [];
    let j = 0;
    for (let i = 0; i < bytes.length; ++i) {
      result[i] = (typeof(bytes[i]) == 'string'
      	? bytes[i].charCodeAt() : bytes[i]) ^ key.charCodeAt(j);
      ++j;
      if (j >= key.length) {
        j = 0;
      }
    }
    return result;
}

function generateString(length) {
    var result           = '';
    var characters       = '_oOxXuUwWiI0123456789';
    var charactersLength = characters.length;
    result += characters.charAt(Math.floor(Math.random() * characters.length - 10));
    length--;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

function scrambleOpcodes() {
    let scrabmled = {}
    let taken = {}
    for (let Idx = 0; Idx < opdata.Opnames.length; Idx++) {
        let A
        do {
            A = `x${genChars(1)}${generateString(10)}`
        } while (taken[A])
        taken[A] = Idx
        scrabmled[Idx] = A
    }

    return [ scrabmled, taken ]
}

class SuperOperator {
    constructor(ip = 0) {
        this.InstrPoint = ip
        this.Instructions = []
        this.Virtuals = []
        this.Name = ''
    }
}

function generateSuperOperators(chunk, settings) {

    let ignoredInstructions = []
    let superOperators = []
    function ProcessInstr(ip = 0) {
        let virtual = new SuperOperator(ip)
        superOperators.push(virtual)

        while (ip < (chunk.Instr.length - 1)) {
            let inst = chunk.Instr[ip]
            if (ignoredInstructions.includes(inst)) {
                if (virtual.Instructions.length < 5) { 
                    superOperators.slice(superOperators.indexOf(virtual), 1) 
                }

                while ((ip + 1) < chunk.Instr.length) {
                    ip++
                    if (!ignoredInstructions.includes(chunk.Instr[ip])) {
                        break
                    }
                }
                if ((ip + 2) < chunk.Instr.length) {
                    ProcessInstr(ip)
                }
                
                break
            }

            virtual.Instructions.push(inst)
            ip++
            if (ip >= (chunk.Instr.length - 1))
                break
            if (virtual.Instructions.length >= 5) {
                ProcessInstr(ip)
                break
            }
        }
    }
    
    let instrPoint = 0
    while (instrPoint < (chunk.Instr.length - 1)) {
        let inst = chunk.Instr[instrPoint]
        if (inst !== null) {
            console.log("->", inst.Name, inst['1'], inst['2'], inst['3'], chunk.Const[inst['2']])
            switch (inst.Name) {
                case 'CLOSURE':
                case 'EQ':
                case 'LT':
                case 'LE':
                case 'TEST':
                case 'TESTSET':
                case 'TFORLOOP':
                case 'SETLIST':
                case 'LOADBOOL':
                case 'LOADTRUE':
                case 'LOADFALSE':
                    if (inst['3'] !== 0) {
                        ignoredInstructions.push(inst)
                    }
                    break
                case 'FORLOOP':
                case 'FORPREP':
                case 'JMP':
                    ignoredInstructions.push(inst)
                    ignoredInstructions.push(inst.References[0])
                    break
                case 'DYNAMICJMP':
                    ignoredInstructions.push(inst)
                    break
                case 'DCONSTS':
                case 'VERIFY':
                    ignoredInstructions.push(inst)
                    break
            }

            if (inst.BackReferences.length > 0) {
                ignoredInstructions.push(inst)
            }

            if (inst.IgnoreInstruction) {
                ignoredInstructions.push(inst)
            }
        }

        instrPoint++
    }

    ProcessInstr()
    let usedNames = {}
    superOperators.forEach((v, i) => {
        let superopName
        do {
            superopName = `${genChars(16)}`
        } while (usedNames[superopName] === true)
        usedNames[superopName] = true

        //chunk.Tree.Chunk.UsedInstructions[superopName] = true
        v.Name = superopName
        chunk.Tree.Chunk.Virtuals.push(v)

        let A = chunk.Tree.Opmap[superopName]
        if (chunk.Tree.Opmap[superopName] === null || chunk.Tree.Opmap[superopName] === undefined) {
            A = superopName
            if (!settings.Debug) {
                do {
                    A = `x${genChars(1)}${generateString(10)}`
                } while (chunk.Tree.ROpmap[A])
            }
        }

        chunk.Tree.ROpmap[A] = superopName
        chunk.Tree.Opmap[superopName] = A
        let idx = chunk.Instr.indexOf(v.Instructions[0]) 
        if (chunk.Instr.indexOf(v.Instructions[0]) === -1) {
            idx = v.InstrPoint
        }

        chunk.Instr.splice(idx, 0, {
            '1': 0,
            '2': 0,
            '3': null,
            IsSuperOp: true,
            Enum: superopName,
            Value: 0,
            Type: 'SOP',
            Name: superopName,
            Instructions: v.Instructions,
            Virtuals: v.Virtuals
        })

    })
}


function visitChunk(chunk, opmap, settings = {}, top = false) {

    chunk.Name = undefined
    chunk.FirstL = undefined
    chunk.LastL = undefined
    chunk.Vargs = undefined
    chunk.Stack = undefined

    chunk.Lines = undefined
    chunk.Locals = undefined
    chunk.Upvalues = undefined

    let consts = chunk.Const.map(v => v)
    let fakeConstants = [ 
        'herrtt is sexy', 'melancholy is weird>:(', 'game', 'HttpGet', 'require', 'loadstring', 'assert', 'load', 'workspace',
        'tonumber', 'gmatch', 'gsub', 'string', 'tostring', 'pcall', 'error', 'setmetatable', 'getrawmetatable', 'getmetatable',
        'rawget', 'rawset', 'char',' byte', 'len', 'assert', 'gBits8', 'gString', 'gSizet', 'gBits32', 'gBits64', 'gInt', 'Args',
        'Name', 'Vargs', 'Stack', 'Decode', 'syn', 'encrypt', 'decrypt', 'encode', 'OpargR', 'constants', 
        'whitelisted', 'wally is gay', 'Synapse XEn WInNing', 'pairs', 'select', 'assert', 'pcall', 'typeof',
        'type', 'unpack', 'coroutine', 'table', 'rawget', 'rawset', 'new', '__instr__', '__const__', '__init__',
        'tostring', 'Chunk', 'sizeof'
    ]
    let l = chunk.Const.length + 3
    consts.push('HERRTT FUSCATOR > ALL')
    for (let i = 0; i < l; i++)
        consts.push(fakeConstants[Math.floor(Math.random() * fakeConstants.length)])
    
    let constIdx = shuffleArray( consts.map((v, i) => i) )
    let newConst = []
    constIdx.forEach((v, i) => {
        newConst[v] = consts[i]
    })

    chunk.Const = newConst

    //console.log(["XORPRIM", chunk.Tree.XORPrimary, "XORSEC:", chunk.Tree.XORSecondary, "XORThird:", chunk.Tree.XORDecodeCKey])
    
    // Encrypt Constants
    // This doesn't work for some reason
    for (let Idx = 0; Idx < chunk.Const.length; Idx++) {
        //console.log(chunk.Const[Idx], chunk.Const[Idx].constructor, xorStrArr(chunk.Const[Idx], chunk.Tree.XORDecodeCKey))
        if (chunk.Const[Idx] !== null && (typeof chunk.Const[Idx] === 'string' || chunk.Const[Idx].constructor == Array)) {
            chunk.Const[Idx] = {
                Encrypted: true,
                Type: typeof chunk.Const[Idx],
                Orig: chunk.Const[Idx], 
                Data: xorStrArr(chunk.Const[Idx], chunk.Tree.XORDecodeCKey)
            }
        }
    }

    chunk.Tree.AddOpcode(chunk, 0, "DCONSTS", {
        Value: 0,
        Type: 'NOP',
        Mode: 4,
        Name: 'DCONSTS'
    })

    let encedConsts = {}
    for (let Idx = 0; Idx < chunk.Instr.length; Idx++) {
        let inst = chunk.Instr[Idx]
        if (inst !== null) {
            switch (inst.Name) {
                // Only Kst(n)
                case 'LOADK': // Kst(Bx) ...
                case 'GETGLOBAL':
                case 'SETGLOBAL':
                    inst['2'] = constIdx[inst['2']]
                    break

                // Both RK(B) & RK(C)
                case 'SETTABLE':

                case 'EQ':
                case 'LT':
                case 'LE':
                    
                case 'ADD':
                case 'SUB':
                case 'MUL':
                case 'DIV':
                case 'MOD':
                case 'POW':
                    if (inst['2'] >= 256)
                        inst['2'] = constIdx[inst['2'] - 256] + 256
                    
                // Only RK(C)
                case 'GETTABLE':
                case 'SELF':
                    if (inst['3'] >= 256)
                        inst['3'] = constIdx[inst['3'] - 256] + 256
                    break

                default: break;
            }

            if (settings.MaximumSecurity && (inst.Name === 'LOADK' || inst.Name === 'GETGLOBAL' || inst.Name === 'SETGLOBAL') && typeof chunk.Const[inst['2']] === 'string') {
                inst.Name = `${inst.Name}_ENC`
                inst.Enum = inst.Name
                if (typeof encedConsts[chunk.Const[inst['2']]] !== "number") {

                    //console.log(chunk.Const[inst['2']], xorStrArr(chunk.Const[inst['2']], chunk.Tree.XORPrimary))
                    // Have to update all instructions that use constants, and I am very much lazy
                    //chunk.Const[inst['2']] = xorStrArr(chunk.Const[inst['2']], chunk.Tree.XORPrimary)

                    // So I just create a new const
                    let newCi = chunk.Const.length
                    encedConsts[chunk.Const[inst['2']]] = newCi
                    if (typeof chunk.Const[inst['2']] === 'string')
                        chunk.Const[newCi] = xorStrArr(chunk.Const[inst['2']], chunk.Tree.XORPrimary)
                    else
                        chunk.Const[newCi] = chunk.Const[inst['2']]
                    inst['2'] = newCi
                } else {
                    //console.log(chunk.Const[inst['2']], encedConsts[chunk.Const[inst['2']]])
                    inst['2'] = encedConsts[chunk.Const[inst['2']]]
                }

                let exists = opmap[inst.Enum]
                let A = opmap[inst.Enum]

                if (A === null || A === undefined) {
                    A = inst.Name
                    if (!settings.Debug) {
                        do {
                            A = `x${genChars(1)}${generateString(10)}`
                        } while (chunk.Tree.ROpmap[A])
                    }
                }

                if (!exists) {
                    chunk.Tree.Chunk.UsedInstructions[inst.Name] = true
                    chunk.Tree.ROpmap[A] = inst.Name
                    chunk.Tree.Opmap[inst.Name] = A
                }


                if (inst !== null && opmap[inst.Enum] !== undefined && opmap[inst.Enum] !== null)
                    inst.Enum = opmap[inst.Enum]
            } else {
                // Randomize opcodes
                if (inst !== null && opmap[inst.Enum] !== undefined && opmap[inst.Enum] !== null)
                    inst.Enum = opmap[inst.Enum]   
            }
        }
    }


    if (top === true && settings.UseSuperops)
        generateSuperOperators(chunk, settings)

    for (let Idx = 0; Idx < chunk.Proto.length; Idx++) {
        visitChunk(chunk.Proto[Idx], opmap, settings)
    }
}

function grabShit() {
    let opmap = {}
    let ropmap = {}
    for (let Idx = 0; Idx < opdata.Opnames.length; Idx++) {
        let A = opdata.Opnames[Idx]
        ropmap[A] = Idx
        opmap[Idx] = A
    }

    return [ opmap, ropmap ]
}

module.exports = {
    ModifyTree: (tree, settings) => {

        tree.XORPrimary = genChars(10)//'O5ouoU_834'//generateString(10)
        tree.XORSecondary = genChars(11)//'i9x1X2u8I42'//generateString(11)
        tree.XORDecodeCKey = genChars(12)//'OU9oI43oo6IO'//generateString(12)

        tree.B64Key = shuffleString(_keyStr) + '='
        _keyStr = tree.B64Key

        let [ opmap, ropmap ] = (settings.Debug !== true || settings.RenameInstructions === true) ? scrambleOpcodes()  : grabShit()
        if (tree.OpQueue != undefined)
            for (let Idx = 0; Idx < tree.OpQueue.length; Idx++) {
                let n = tree.OpQueue[Idx]
                let A
                if (settings.Debug)
                    A = n
                else
                    do {
                        A = `x${genChars(1)}${generateString(10)}`
                    } while (ropmap[A])
                ropmap[A] = n
                opmap[n] = A
            }
    
        tree.Opmap = opmap
        tree.ROpmap = ropmap
        visitChunk(tree.Chunk, opmap, settings, true)
        tree.Headers.Signature = 'Herrtt Obfuscator'

        if (settings.Debug !== true && settings.AntiTamper === true) {
            tree.AddOpcode(tree.Chunk, 0, "VERIFY", {
                Value: 1,
                Type: 'AsBx',
                Mode: 4,
                Name: 'VERIFY',

                '1': 0,
                '2': -52
            })
    
            tree.AddOpcode(tree.Chunk, 0, "CHECKLINE", {
                Value: 1,
                Type: 'AsBx',
                Mode: 4,
                Name: 'CHECKLINE',

                '1': 0,
                '2': -52
            })
        }

        return tree
    }
}