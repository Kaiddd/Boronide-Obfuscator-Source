
/*
    generator.js - herrtt
*/

const date = new Date()

let lastTime = null;
const print =() => null;/*
    let newT = new Date().getTime()
    let diff = newT - (lastTime === null ? newT : lastTime)
    lastTime = newT
    console.log(`| ms since l.p.`, diff, `| :`, x)
}*/

const fs = require('fs');
const path = require('path');
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


const opdata = require('../Bytecode/opdata.json')
const vmPath = path.join(global.TopDir, 'vm')
const vm = {
    opcodes: []
}


for (let Idx = 0; Idx < opdata.Opnames.length; Idx++) {
    let opname = opdata.Opnames[Idx]
    let path_ = path.join(vmPath, 'opcodes', `${opname}.lua`)
    if (fs.existsSync(path_)) {
        vm.opcodes[Idx] = {
            name: opname,
            code: fs.readFileSync(path_).toString()
        }
    }
}

var customOpcodeFiles = fs.readdirSync(path.join(vmPath, 'customOpcodes'))
for (filename of customOpcodeFiles) {
    let name = filename.split('.').slice(0, -1).join('.') // Sliced file extension
    vm.opcodes[name] = {
        name: name,
        code:  fs.readFileSync(path.join(vmPath, 'customOpcodes', filename)).toString()
    }
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

function genString(length) {
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

function makeId(length) {
    var result           = '';
    var characters       = '_xXyYzoOiIlLZ0123456789';
    var charactersLength = characters.length;
    result += characters.charAt(Math.floor(Math.random() * (characters.length - 10 )));
    length--;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

function toEscStr(arr) {
    let a = ''
    if (arr.length > 0)
        a += '\\'
    return a + arr.join('\\')
}

function toEscStrF(str) {
    let a = ''
    for (let i = 0; i < str.length; i++)
        a += `\\${str.charCodeAt(i)}`
    return a
}

function cControlFlow(code, n = Math.floor(Math.random() * 7000), a = Math.floor(Math.random() * 7000), depth = 0, depthValues) {
    depthValues = depthValues || []
    depthValues.push([ n, a ])

    let src = depth === 0 ? `local N_1_ = ${n};\nlocal A_1_ = ${a};\n` : '';
    if (n < a) {
        src += `while (N_1_ < A_1_) do\n` 
        src += `A_1_ = N_1_ - ${a * 2};\n`
        a = n - (a * 2)
        depthValues[depth][2] = '1'
    } else if(n > a) {
        let ran = Math.floor(Math.random() * 5000) + 10
        src += `while (N_1_ > (A_1_ - ${Math.floor(Math.random() * 3) + 10})) do\n`
        src += `A_1_ = (N_1_ + ${ran}) * 2;\n`
        a = (n + ran) * 2;
        depthValues[depth][2] = '2'
    } else if(n === a) {
        let ran = Math.floor(Math.random() * 5000) + 10
        src += `while (N_1_ == A_1_) do\n`
        src += `A_1_ = (N_1_ + ${ran}) * 2;\n`
        a = (n + ran) * 2;
        depthValues[depth][2] = '3'
    }

    if (depth === (code.length - 1)) {
        src += `${code.shift()}\n`;
    } else {
    	let [ _1, _2, _3 ]  = cControlFlow(code, n, a, depth + 1, depthValues)
        src += _1
        n = _2
        a = _3 
    }
    src += `end;\n`

    let dp = depthValues[depth - 1] 
    if (dp != undefined) {
        let [ dn, da, dt ] = dp
        if (n > a) {
            src += `if N_1_ > (A_1_ - ${n * 2}) then\n`
        } else if(n < a) {
            src += `if (${n * 2} - N_1_) < (A_1_ + ${n + Math.floor(Math.random() * 50)}) then\n`
        } else if(n == a) {
            src += `if N_1_ == A_1_ then\n`
        }

        if (dt == '1') {
            src += `N_1_ = ((A_1_ + ${dn}) * 2);\n`
            n = (a + dn) * 2
            if (code[0] != undefined)
                src += `${code.shift()}\n`
            src += `end;\n`
        } else if(dt == '2') {
            src += `A_1_ = (N_1_ + ${(dn) * 2});\n`
            a = n + (dn) * 2
            if (code[0] != undefined)
                src += `${code.shift()}\n`
            src += `end;\n`
        } else if(dt == '3') {
            src += `N_1_ = (A_1_ / 2) - ${dt * 2};\n`
            n = (a / 2) - (dt * 2)
            if (code[0] != undefined)
                src += `${code.shift()}\n`
            src += `end;\n`
        }
    }

	return depth === 0 ? src : [ src, n, a ] 
}

let opstatTypes = [
    `if (__A__ ~= __X__) then\n\t--RELOOP\nelse\n\t--CODE_A\nend;`,
    `if (__X__ ~= __A__) then\n\t--RELOOP\nelse\n\t--CODE_A\nend;`,
    `if (__A__ == __X__) then\n\t--CODE_A\nelse\n\t--RELOOP\nend;`,
    `if (__X__ == __A__) then\n\t--CODE_A\nelse\n\t--RELOOP\nend;`,

    `if (__A__ ~= __X__) then\n\t--RELOOP\nelseif (__X__ == __A__) then\n\t--CODE_A\nend;`,
    `if (__X__ ~= __A__) then\n\t--RELOOP\nelseif (__A__ == __X__) then\n\t--CODE_A\nend;`,
    `if (__A__ == __X__) then\n\t--CODE_A\nelseif (__X__ ~= __A__) then\n\t--RELOOP\nend;`,
    `if (__X__ == __A__) then\n\t--CODE_A\nelseif (__X__ ~= __A__) then\n\t--RELOOP\nend;`
]

let replaceAll = (str, ser, rep) => 
    str.split(ser).join(rep)

function generateSuperOp(virtual, tree) {
    let obf = ''

    //console.log(virtual.Name)
    virtual.Instructions.forEach((v, i) => {
        if (v !== null) {
            //console.log( v.Name, v.Enum, v.Name.toString(), tree.ROpmap[v.Name.toString()])
            obf += `\nInst = Chunk['|Inst|'][pc]; pc = pc + 1;\n`
            obf += vm.opcodes[tree.ROpmap[v.Enum.toString()]].code
        }
    })


    return obf
}

function CreateOpcodeStat(opcodes, fakeCode = [], tree, debug = false, d = 0) {
    
    let type = Math.floor(Math.random() * opstatTypes.length)
    let codeR = opstatTypes[type]
    let s = ''
    let codeA
    let name
    if (typeof opcodes[0] === 'object') {
        if (opcodes[0].fake === true) {
            name = opcodes[0].name
            codeA = { code: (shuffleArray(fakeCode)[0] !== null && fakeCode[0] !== undefined) ? fakeCode[0] : '', fake: true }
        } else {
            name = opcodes[0].Name
            codeA = { code: generateSuperOp(opcodes[0], tree), fake: true , name: 'ban'}
        }

    } else {
        name = opcodes[0]
        codeA = vm.opcodes[tree.ROpmap[opcodes[0].toString()]]
    }

    if (!codeA) {
        throw `Missing ${opdata.Opnames[tree.ROpmap[opcodes[0].toString()]]}, ${tree.ROpmap[opcodes[0].toString()]}`; 
    }

    if (codeA.fake !== true && debug !== true && codeA.modified !== true) {
        //codeA.code = cControlFlow([ codeA.code ])
        codeA.modified = true
    }

    codeR = replaceAll(codeR, '__A__', `"${name}"` )
    codeR = replaceAll(codeR, '__X__', 'OP_CODE')
    codeR = replaceAll(codeR, '--CODE_A', codeA.code)
    codeR = replaceAll(codeR, '\n', '\n' + (d <= 0 ? '' : '\t'.repeat(d)))
    if (opcodes.length <= 1) {
        codeR = replaceAll(codeR, '--RELOOP', '')
    } else {
        opcodes.shift()
        codeR = replaceAll(codeR, '--RELOOP', CreateOpcodeStat(opcodes, fakeCode, tree, debug, d + 1))
    }

    s += codeR
    return s
}

function from_int(x, b = 4) {
    let v = []
    x = Math.floor(x)
    if (x < 0) {
        x = 4294967296 + x
    }
    for (i = 0; i < b; i++) {
        let c = x % 256
        v.push(c)
        x = Math.floor(x / 256)
    }
    return v
}

function updateRegisters(inst, chunk) {
    if (inst.IsDataType)
        return;
    
    inst.InstrPoint = chunk.Instr.indexOf(inst)
    //console.log("UPD:", inst.Name)
    switch (inst.Name) {
        case 'LOADK':
        case 'GETGLOBAL':
        case 'SETGLOBAL':
            // Update constants (later?)
            break

        case 'JMP':
        case 'FORLOOP':
        case 'LOADJUMP': // Custom
        case 'FORPREP':
            //console.log("WA:", inst['2'], chunk.Instr.indexOf(inst.References[0]) - chunk.Instr.indexOf(inst) - 1)
            inst['2'] = chunk.Instr.indexOf(inst.References[0]) - chunk.Instr.indexOf(inst) - 1
            break
        default: break
    }

}

function CreateInstDecoder(chunk, tree, settings) {
    let createControlFlow = settings.Debug === true ?  c => c.join('\n') : cControlFlow;
    let dec = ''
    
    
    let eTypes = {
        ABC: 'a',
        ABx: 'b',
        AsBx: 'x',
        NOP: 'n',
        SOP: 's'
    }

    let BooleanEnc = {
        True: 'x',
        False: 'y'
    }

    dec += `
    local usedInstsCache = { }
    local function decodeLoadStr(str)
        local t = { }
        local p = 1
        local l = #str - 1
    
    
        local read = function(len)
            len = len or 1
            local c = sub(str, p, p + (len - 1))
            p = p + len
            return c 
        end

        
        local gByte2 = function()
            local x, y = byte(str, p, p + 1)
            p = p + 2
            return (y * 256) + x
        end	

        local gByte3 = function()
            local x, y, z = byte(str, p, p + 2)
            p = p + 3
            return (z * 65536) + (y * 256) + x
        end	
    
        local gByte4 = function()
            local w, x, y, z = byte(str, p, p + 3)
            p = p + 4
            return (z * 16777216) + (y * 65536) + (x * 256) + w;
        end

        local gByte5 = function()
            local w, x, y, z, a = byte(str, p, p + 4)
            p = p + 5
            return (z * 16777216) + (y * 65536) + (x * 256) + w
                + (a * 4294967296);
        end
    
        local char0, char1, char2, char3 = char(0), char(1), char(2), char(3)
        local _n1, _n2, _n3 = byte(char1), byte(char2), byte(char3)
        local _INST = VM["__instr__"];
        local gABC = function()
            local a, b, c;
            local type = read()
            if (type == "${eTypes.NOP}" or type == "${eTypes.SOP}") then
                return a, b, c
            else
                local t1 = read()
                if t1 == char0 then
                    a = byte(read())
                elseif t1 == char1 then
                    a = read() == '${BooleanEnc.True}'
                end

                local t2 = read()
                if t2 == char0 then
                    local num = (type == "${eTypes.ABC}") and gByte3() or gByte4()
                    if (type == "${eTypes.AsBx}") then
                        num = num - 131071;
                    end
                    b = num
                elseif t2 == char1 then
                    b = read() == '${BooleanEnc.True}'
                end

                if (type == "${eTypes.ABC}") then
                    local t3 = read()
                    if t3 == char0 then
                        c = gByte3()
                    elseif t3 == char1 then
                        c = read() == '${BooleanEnc.True}'
                    end
                end

                return a, b, c
            end
        end

        while true do
            local c = read()
            --print("=>", c:byte(), p)
            ${shuffleArray([
                `if c == char0 then -- addinst
                    local Inst = {};
                    local opn_size = byte(read());
                    local opname = read(opn_size);
                    local a, b, c = gABC();
                    ${shuffleArray([
                        "Inst[_n1] = a;",
                        "Inst[_n2] = b;",
                        "Inst[_n3] = c;",
                        `Inst["__value__"] = gByte5();`
                    ]).join('\n')}
                    --print("-", opname, a, b, c, Inst["__value__"]);
                    VM(opname)(Inst);
                    local index = gByte4();
                    usedInstsCache[index] = opname;
                end;`,
                `if c == char1 then -- addinst from cache
                    local Inst = {};
                    local index = byte(read());--gByte4();
                    local opname = usedInstsCache[index];
                    local a, b, c = gABC();
                    ${shuffleArray([
                        "Inst[_n1] = a;",
                        "Inst[_n2] = b;",
                        "Inst[_n3] = c;",
                        `Inst["__value__"] = gByte5();`
                    ]).join('\n')}

                    --print("-", opname, a, b, c, Inst["__value__"]);
                    VM(opname)(Inst);
                end`,
                `if c == char2 then -- break
                    break
                end`
            ]).join('\n')}
    
            if p > l then
                break
            end
        end;
    
        for i,v in pairs(usedInstsCache) do 
            usedInstsCache[i] = nil; 
        end;
        usedInstsCache = nil;

        return t;
    end
    `

    let instCache = {}
    let cIdx = 0
    let s = ''
    for (let idx in chunk.Instr) {
        let inst = chunk.Instr[idx]
        if (inst === null)
            continue;


         //console.log("-1>", inst.Name, inst['1'], inst['2'], inst['3'])
         updateRegisters(inst, chunk)
         //console.log("-2>", inst.Name, inst['1'], inst['2'], inst['3'])

        let cacheIdx = instCache[inst.Enum]
        let inCache = typeof cacheIdx === 'number'
        if (!inCache)
            cacheIdx = ++cIdx;

        s += `\\${inCache ? 1 : 0}`;

        if (inCache)
            s += `\\${from_int(cacheIdx, 1).join('\\')}`;
        else
            s += `\\${from_int(inst.Enum.length, 1).join('\\')}${inst.Enum}`; // Name Length + Name

        s += (eTypes[inst.Type]); // Type
        if (inst.Type === 'SOP' || inst.Type === 'NOP') {
            s += `\\${from_int(inst.Value, 5).join('\\')}`;
            if (!inCache) {
                instCache[inst.Enum] = cIdx;
                s += `\\${from_int(cIdx).join('\\')}`;
            }
        } else {
            if (typeof inst['1'] === 'boolean')
                s += `\\1${inst['1'] === true ? BooleanEnc.True : BooleanEnc.False}`;
            else
                s += `\\0\\${from_int(inst['1'] === null ? 0 : inst['1'], 1).join('\\')}`;

            if (typeof inst['2'] === 'boolean')
                s += `\\1${inst['2'] === true ? BooleanEnc.True : BooleanEnc.False}`;
            else {
                let n = inst['2'] === null ? 0 : inst['2'];
                if (inst.Type === 'AsBx')
                    n = n + 131071;
                s += `\\0\\${from_int(n, inst.Type === 'ABC' ? 3 : 4).join('\\')}`;
            }

            if (inst['3'] !== null) {
                if (typeof inst['3'] === 'boolean')
                    s += `\\1${inst['3'] === true ? BooleanEnc.True : BooleanEnc.False}`;
                else
                    s += `\\0\\${from_int(inst['3'] === null ? 0 : inst['3'], 3).join('\\')}`;
            }

            s += `\\${from_int(inst.Value, 5).join('\\')}`;
            if (!inCache) {
                instCache[inst.Enum] = cIdx;
                s += `\\${from_int(cIdx).join('\\')}`;
            }
        }
    }
    s += `\\2`;

    dec += `
    decodeLoadStr(|INST_LOAD_VAR|);
    `

    return [ dec, s ]
}


module.exports = {
    Generate: async function(tree, settings) {
        print("Generating code")
        let strs = []
        function genUniString(l = 9) {
            let res
            do {
                res = `x${makeId(l)}`
            } while (strs.includes(res))
            strs.push(res)
            return res
        }

        let s = ''
        //s += vm.start

        print("creating keys and unique names")
        let ranKey = genString(12)
        let ranKey2 = `_${genUniString()}`
        let stringGmatchIdx = `_${genUniString(15)}`
        let stringCharIdx = `_${genUniString(15)}`
        let stringByteIdx = `_${genUniString(15)}`
        let mtIdxStr = `_${genUniString(Math.floor(Math.random() * 6) + 12)}`
        let xorName = `_${genUniString(16)}`

        print("preparing control flow")
        let createControlFlow = settings.Debug === true ?  c => c.join('\n') : cControlFlow

        print("creating header and bits functions")

        let watermarkStart = `\nlocal ${shuffleArray([ 'CONST_TABLE', 'gfenv', 'WATERMARK' ]).join(', ')} = nil, nil, nil;\n([[${settings.Watermark}]]):gsub('IGNORE:(.*)', function(w)

            ${(shuffleArray([
                `local watermark = "IGNORE:${genString(Math.floor(Math.random() * 20) + 5)}";`,
                `local Shit = "IGNORE:${genString(Math.floor(Math.random() * 20) + 5)}";`, 
            ])).join('\n')}
            ${createControlFlow(shuffleArray([
                "watermark = w",
                "Shit = w",
                "gfenv = getfenv or function() return _ENV end;"
            ]))}
            
            local __ENV__ = gfenv();
            local charConst = __ENV__["IGNORE:string"]["IGNORE:${toEscStrF("char")}"](${("char").split('').map(v => v.charCodeAt()).join(', ')})
            local string = __ENV__[string[charConst](${("string").split('').map(v => v.charCodeAt()).join(', ')})];
            ${(shuffleArray([
                `local byte = "IGNORE:${genString(Math.floor(Math.random() * 20) + 2)}";`,
                `local char = "IGNORE:${genString(Math.floor(Math.random() * 20) + 2)}";`, 
                `local gmatch = "IGNORE:${genString(Math.floor(Math.random() * 20) + 2)}";`  
            ])).join('\n')}

            ${createControlFlow([
                `char = __ENV__[string[charConst](${("string").split('').map(v => v.charCodeAt()).join(', ')})][charConst];`,
                `byte = __ENV__[string[charConst](${("string").split('').map(v => v.charCodeAt()).join(', ')})][string[charConst](${("byte").split('').map(v => v.charCodeAt()).join(', ')})];`,
                `gmatch = __ENV__[string[charConst](${("string").split('').map(v => v.charCodeAt()).join(', ')})][string[charConst](${("gmatch").split('').map(v => v.charCodeAt()).join(', ')})];`
            ])}
            CONST_TABLE = {
                [watermark] = ${settings.Watermark.length},
                ['IGNORE:${toEscStrF("_")}' .. char(${(settings.Watermark).split('').map(v => v.charCodeAt()).join(', ')}) ] = Shit
            }

            CONST_TABLE[string[charConst](${(stringByteIdx).split('').map(v => v.charCodeAt()).join(', ')})] = byte;
            CONST_TABLE[string[charConst](${(stringCharIdx).split('').map(v => v.charCodeAt()).join(', ')})] = char;
            CONST_TABLE[string[charConst](${(stringGmatchIdx).split('').map(v => v.charCodeAt()).join(', ')})] = gmatch;
            ${createControlFlow([
                `if (CONST_TABLE[watermark] ~= nil and (#Shit ~= CONST_TABLE[watermark])) then return 0; end;`,
                `if (char(${(settings.Watermark).split('').map(v => v.charCodeAt()).join(', ')}) ~= watermark) then return false; end`,
                `if (Shit ~= CONST_TABLE['IGNORE:${toEscStrF("_")}' .. watermark]) then return ""; end;`,
                `WATERMARK = watermark`,
            ])}

            WATERMARK = watermark;
            CONST_TABLE[watermark] = nil;
        end);
        local char = CONST_TABLE["IGNORE:${stringCharIdx}"];
        local byte = CONST_TABLE["IGNORE:${stringByteIdx}"];
        local gmatch = CONST_TABLE["IGNORE:${stringGmatchIdx}"];
        local string = gfenv()[char(${("string").split('').map(v => v.charCodeAt()).join(', ')})];
        local format = string[char(${("format").split('').map(v => v.charCodeAt()).join(', ')})];
        local sub = string[char(${("sub").split('').map(v => v.charCodeAt()).join(', ')})];
        local next = gfenv()[char(${("next").split('').map(v => v.charCodeAt()).join(', ')})];
        local concat = gfenv()[char(${("table").split('').map(v => v.charCodeAt()).join(', ')})][char(${("concat").split('').map(v => v.charCodeAt()).join(', ')})];
        local assert = gfenv()[char(${("assert").split('').map(v => v.charCodeAt()).join(', ')})];
        local pairs = gfenv()[char(${("pairs").split('').map(v => v.charCodeAt()).join(', ')})];
        local len = string[char(${("len").split('').map(v => v.charCodeAt()).join(', ')})]
        local rawget = gfenv()[char(${("rawget").split('').map(v => v.charCodeAt()).join(', ')})];
        local unpack = gfenv()[char(${("unpack").split('').map(v => v.charCodeAt()).join(', ')})];


        local charactertable = {}
        local basedictdecompress = {}
        for i = 0, 255 do
            local ic, iic = char(i), char(i, 0)
            charactertable[ic] = iic
            basedictdecompress[iic] = ic
        end

        CONST_TABLE["IGNORE:${stringByteIdx}"] = nil;
        CONST_TABLE["IGNORE:${stringCharIdx}"] = nil;
        CONST_TABLE["IGNORE:${stringGmatchIdx}"] = nil;
        local sub = gfenv()[char(${("string").split('').map(v => v.charCodeAt()).join(', ')})][char(${("sub").split('').map(v => v.charCodeAt()).join(', ')})];
        local constMTableIndex = "IGNORE:${mtIdxStr}";
        
        local domath = function(...) return ... end;
        local wordindex = 0;
        local environment = {''}
        
        ${shuffleArray([
            `local getAWord = function(len, str, wordindex, Environment)
                len = len or 1
                local word = Environment["|Stringsub|"](str, wordindex, domath(wordindex, domath(len, 1, "|SUB|"), "|ADD|")) --// wordindex + (len - 1)
                wordindex = domath(wordindex, len, "|ADD|") --// wordindex + len
                return word
            end`,
            `--// generate this one like 1-3 times but randomize the 256
            local getBWord = function(str, wordindex, Environment)
                local left, right = Environment["|Stringbyte|"](str, wordindex, wordindex + 1)
                wordindex = wordindex + 2
                return (right * 256) + left
            end`,
            `--// generate this one 2-3 times and randomize the 65536 and 256
            local getCWord = function(str, wordindex, Environment)
                local left, right, front = Environment["|Stringbyte|"](str, wordindex, wordindex + 2)
                wordindex = wordindex + 3
                return (front * 65536) + (right * 256) + left
            end`,
            `--// generate this one 4-5 times and randomize the numbers
            local getDWord = function(str, wordindex, Environment)
                local left, right, front, bacl = Environment["|Stringbyte|"](str, wordindex, wordindex + 3)
                wordindex = wordindex + 4
                return (back * 16777216) + (front * 65536) + (right * 256) + left;
            end`,
            `--// generate this one 5 times and randomize the numbers
            local getQWord = function(str, wordindex, Environment)
                local left, right, front, back, top = Environment["|Stringbyte|"](str, wordindex, wordindex + 4)
                wordindex = wordindex + 5
                return (back * 16777216) + (front * 65536) + (right * 256) + left
                + (top * 4294967296);
            end`
        ]).join('\n')}

        --nerd
        -- thanks melancholy

        -- // equality, less than, greater than test
        local function check(val, val2, statement)
            assert(statement, "dm this to Herrtt or Melancholy")
            if statement == "|EQ|" then
                return val == val2
            elseif statement == "|LT|" then
                return val < val2
            elseif statement == "|LE|" then
                return val <= val2
            end
        end
        
        -- // maths stuff
        local function domath(val, val2, statement)
            assert(statement, "dm this to Herrtt or Melancholy")
            if check(statement, "|MUL|", "|EQ|") then --// if statement == "|MUL|" then
                return val * val2
            elseif check(statement, "|DIV|", "|EQ|") then --// if statement == "|DIV|" then
                return val / val2
            elseif check(statement, "|ADD|", "|EQ|") then --// if statement == "|ADD|" then
                return val + val2
            elseif check(statement, "|SUB|", "|EQ|") then --// if statement == "|SUB|" then
                return val - val2
            elseif check(statement, "|MOD|", "|EQ|") then --// if statement == "|MOD|" then
                return val % val2
            elseif check(statement, "|POW|", "|EQ|") then --// if statement == "|POW|" then
                return val ^ val2
            end
        end
        
        -- // dont know what to call this tbh
        local function reverser(val, statement)
            assert(statement, "dm this to Herrtt or Melancholy")
            if check(statement, "|UNM|", "|EQ|") then --// if statement == "|UNM|" then
                return -val
            elseif check(statement, "|NOT|", "|EQ|") then --// if statement == "|NOT|" then
                return not val
            elseif check(statement, "|LEN|", "|EQ|") then --// if statement == "|LEN|" then
                return #val
            end
        end
        
        -- // concat stuff
        local function concat(val, val2, statement)
            assert(statement, "dm this to Herrtt or Melancholy")
            if check(statement, "|CONCATSTRING|", "|EQ|") then --// if statement == "|CONCATSTRING|" then
                return val .. val2
            elseif check(statement, "|CONCATTABLE|", "|EQ|") then --// statement == "|CONCATTABLE|" then
                return concat(val, val2)
            end
        end
        

        local chartbl = {}
        local ${shuffleArray([ 'BitXOR', 'XORString', 'XORTable', 'XORString1Fake', 'XORTable1Fake' ]).join(', ')}
        ${createControlFlow(shuffleArray([
            `
            XORString1Fake = function(str, key)
                local res = "IGNORE:";
                local a = 1
                for i = 1,#str do
                    local xored = BitXOR(byte(sub(str, i, i)), byte(sub(key, a,a)) )
                    res = res .. rawget(chartbl, xored) or xored
                    a = a + 1;
                    if a > #key then
                        a = 1
                    end
                end
    
                return res   
            end;
            `,
            `
            XORTable1Fake = function(tabl, key)
                local res = "IGNORE:";
                local a = 1
                for i = 1,#tabl do
                    local xored = BitXOR(tabl[i], byte(sub(key, a,a)) )
                    res = res .. chartbl[xored] or xored
                    a = a + 1;
                    if a > #key then
                        a = 1;
                    end
                end
    
                return res
            end;
            `
            ]))}

        BitXOR = function(a,b) --Bitwise xor
            local p,c=1,0
            while a>0 and b>0 do
                local ra,rb=a%2,b%2
                if ra~=rb then c=c+p end
                a,b,p=(a-ra)/2,(b-rb)/2,p*2
            end
            if a<b then a=b end
            while a>0 do
                local ra=a%2
                if ra>0 then c=c+p end
                a,p=(a-ra)/2,p*2
            end
            return c
        end;

        for i, v in pairs(charactertable) do
            chartbl[byte(i)] = i
        end

        ${createControlFlow(shuffleArray([
        `
        XORString = function(str, key)
            local res = "IGNORE:";
            local a = 1
            for i = 1,#str do
                local xored = BitXOR(byte(sub(str, i, i)), byte(sub(key, a,a)) )
                res = res .. rawget(chartbl, xored) or xored
                a = a + 1;
                if a > #key then
                    a = 1
                end
            end

            return res   
        end;
        `,
        `
        XORTable = function(tabl, key)
            local res = "IGNORE:";
            local a = 1
            for i = 1,#tabl do
                local xored = BitXOR(tabl[i], byte(sub(key, a,a)) )
                res = res .. chartbl[xored] or xored
                a = a + 1;
                if a > #key then
                    a = 1;
                end
            end

            return res
        end;
        `
        ]))}
        
        local NumberTable = { {}, {} }
        local TrackNumberTable = 1
        for i = 1, 255 do
            if i >= 112 then
                NumberTable[2][TrackNumberTable] = i
            TrackNumberTable = TrackNumberTable + 1
            else
                NumberTable[1][i] = i
            end
        end

        local characters = char(unpack(NumberTable[1])) .. char(unpack(NumberTable[2]))

        local ${shuffleArray([ 
            'XORTableSec', 
            'XORStringSec', 
            'xorSecondaryKey', 
            'xorPrimaryKey',
            'XORStringPrim',
            'xorDecodeckey',
            'XORStringPrim1'
        ]).join(', ')};
        xorSecondaryKey = XORTable({${xorStrArr(tree.XORSecondary, ranKey).join(', ')}}, "IGNORE:${toEscStrF(ranKey)}");

        ${createControlFlow(shuffleArray([
            `XORTableSec = function(...)
                return XORTable(..., xorSecondaryKey)
            end;`,
            `XORStringSec = function(a, ...)
                return XORString(a, xorSecondaryKey, ...)
            end;`,
            `XORStringPrim = function(a, ...)
                return XORString(a, xorPrimaryKey, ...)
            end;`
        ]))}

        xorPrimaryKey = XORTable({${xorStrArr(tree.XORPrimary, ranKey).join(', ')}}, "IGNORE:${toEscStrF(ranKey)}");
        xorDecodeckey = XORTable({${xorStrArr(tree.XORDecodeCKey, ranKey).join(', ')}}, "IGNORE:${toEscStrF(ranKey)}");
        local _1 = byte(char(1));
        CONST_TABLE["IGNORE:${xorName}"] = function(str, key)
            local res = char();
            local a = _1;
            for i = _1, #str do
                local xored = BitXOR( byte(sub(str, i, i)), byte(sub(key, a,a)) );
                res = format(("%s%s"), res, rawget(chartbl, xored) or xored);
                a = a + _1;
                a = (a > #key and _1) or a;
            end;
            return res;
        end;
        local xorStrS1 = CONST_TABLE[XORTableSec({${xorStrArr(xorName, tree.XORSecondary)}})];
        \n`

        s += `CONST_TABLE = |ConstantTable|`
        s += `CONST_TABLE["${xorName}"] = xorStrS1;`

        print("adding environment variables")
        let env = shuffleArray([
            "string", "pcall", "error", 
            "table", "setmetatable", "tostring", 
            "tonumber", "print", "type", 
            "unpack", "pairs", "select", 
            "assert", "coroutine", "getmetatable",
            "rawget", "setraw"
            
        ])
        
        s += `\n--START_ENV_LOAD\n`
        for (n of env) {
            let xored = `{${xorStrArr(n, tree.XORSecondary).join(', ')}}`
            s += `local ${n} = gfenv()[XORTableSec(${xored})];\n`
        }
        s += `local xorStr = CONST_TABLE["IGNORE:${toEscStrF(xorName)}"];`
        s+= `\n--END_ENV_LOAD\n`

        s += `local cyield = coroutine["yield"];`

        print("adding error handling")
        s += `\nlocal function whatLineErr(...)
    local _, str = ...
    local Matched = gmatch(tostring(str), ':(%d*):')()
    return tonumber(Matched)
end;

local StartLine = whatLineErr(pcall(function() local a = "a" ^ 1 end));`    


        s += `\nlocal print = print;`

        s += `\nlocal function _Returns(...)
    return select('#', ...), {...};
end;`

        print("creating start of wrapper")
        s += `\n

        local |INST_LOAD_VAR| = |INST_LOAD_SRC|;
        

        if (CONST_TABLE[constMTableIndex] == nil) then
            return (function()
                while print ~= gfenv do
                    WATERMARK = sub(WATERMARK, 1, #WATERMARK - 1) .. '${Math.random() * 10}';
                end
            end)()
        end;

        -- // integrity check character table
        local function integritycheckchartbl()
            if reverser(check(getmetatable(chartbl), nil, "|EQ|"), "|NOT|") then -- // if getmetatable(chartable) ~= nil then
                return cyield()
            end
        end

        local function new(signature, size_or_C, chunk_or_upvals, env, uvals)
            ${(() => {
                let a = [
                    "local Chunk;",
                    "local current;",
                    "local last;",
                    "local ran;",
                    "local InstLen;",
                    "local ConstLen;",
                    "local ProtoLen;",
                    "local Env;",
                    "local size_constinst;",
                    "local Lupvals;",
                    "local Upvalues;",
                    "local isClosure = false;",
                    "for _ in integritycheckchartbl do break end;"
                ]

                let r = Math.floor((Math.random() * 5) + 2)
                for (let i = 0; i < r; i++)
                    a.push(`local x${genString(9)} = "${genString(Math.floor(Math.random() * 10))}";`)

                return shuffleArray(a).join('\n')
            })()}

            if ((signature ~= 0 and size_or_C ~= "|OP_CLOSURE|") and signature ~= "|Signature|") then
                while (signature ~= 0) do
                    size_or_C = '${genString(Math.floor(Math.random() * 16))}';
                end;
            elseif (signature == 0 and size_or_C == "|OP_CLOSURE|") then
                isClosure = true;
            end;

            local ctable = {}
            for i = 1, domath(64, 4, '|MUL|') do
                ctable[i] = char(domath(i, 1, '|SUB|'))
            end

            local XORString1
            local xorPrimaryKey1 = (function(a, ...) 
                return a and xorPrimaryKey
            end)("${genString(10)}")
            local res = concat('', char(), '|CONCATSTRING|');
            ${createControlFlow(["Chunk = isClosure and (chunk_or_upvals) or ({});"])}
            ${createControlFlow(shuffleArray([
                "ran = false;",
                "Env = (isClosure == true and env) or (isClosure == false and uvals or gfenv()) or {};",
                "size_constinst = isClosure and ({}) or (size_or_C)",
                `Chunk['|T_UPVALS|'] = isClosure and (Chunk['|T_UPVALS|']) or (chunk_or_upvals);`,
                "Lupvals = {}",
                "InstLen = isClosure and (Chunk['|Inst|'][-1]) or (1);",
                "ConstLen = isClosure and (Chunk['|Const|'][-1]) or (0);",
                "ProtoLen = (0);",
                "Upvalues = isClosure and uvals;"
            ]))}

            ${createControlFlow([
                `XORString1 = function(str, key)
                    local res1 = res
                    local a = reverser(-1, '|UNM|')
                    for i = 1, len(str) do
                        local xored = BitXOR(byte(sub(str, i, i)), byte(sub(key, a,a)) )
                        res1 = concat(res1, sub(characters, xored, xored) or xored, '|CONCATSTRING|');
                        a = check(len(key), a + 1, '|LT|') and 1 or domath(a, 1, '|ADD|');
                    end

                    return res1
                end;`,
                `XORStringPrim1 = function(a, ...)
                    return XORString1(a, xorPrimaryKey1, ...);
                end;`
            ])}
            

            local Metamethods_ = {`

        
            print("creating metamethods")
        let Metamethods = [
`\n["__index"] = function(self, index)
    if (isClosure ~= true and ran) then
        ${createControlFlow([
            " while (1 == 1 and ran == (#Chunk > -1)) do Chunk[index] = '\\0' end;",
            "return;",
        ])}
    elseif (Chunk == nil) then
        Chunk = {}
    end;

    ${createControlFlow(shuffleArray([
        "if (index == '__instr__') then current = index; end;",
        "if (index == '__const__') then current = index; end;",
        "if (index == '__proto__') then current = index; end;",
        "if (index == '__init__') then current = index; end;",
    ]))}

    if (index ~= '__instr__' and index ~= '__const__' and index ~= '__init__' and index ~= '__proto__') then
        ${createControlFlow([
            "return error('invalid index!');"
        ])}
    end
    return self
end;`,

`\n["__call"] = function(self, arg, A, B, C, D)
if (isClosure ~= true and ran) then
    return error('Already ran (1)!')
end
if (current == '__instr__') then
    if (last) then
        ${createControlFlow([
            `
            local Inst = { ['|Opcode|'] = last };
            ${createControlFlow(shuffleArray([
                "|A| = arg[1];",
                "|B| = arg[2];",
                "|C| = arg[3];",
                "Inst['SUPER_OP'] = false;",
                "Chunk['|Inst|'][InstLen] = Inst;"
            ]))}
            `,
            "InstLen = InstLen + 1;",
            "last = nil;",
        ])}
    else
        ${createControlFlow([
            "last = arg",
        ])}
    end
elseif (current == '__const__') then
    local IDX;
    ${createControlFlow([
        "IDX = Chunk['|Const|'][ConstLen - 1];",
    ])}
    if (arg == nil and type(IDX) == "string") then
        ${createControlFlow([
            "Chunk['|Const|'][ConstLen - 1] = { XORStringSec(IDX) };",
        ])}
    elseif (type(arg) == "table" and arg["${ranKey2}"] == true) then
        ${createControlFlow([
            "Chunk['|Const|'][ConstLen] = arg;",
            "ConstLen = ConstLen + 1;",
        ])}
    elseif (type(arg) == "table") then
        ${createControlFlow([
            "Chunk['|Const|'][ConstLen] = arg[1] or nil;",
            "ConstLen = ConstLen + 1;",
        ])}
    else
        ${createControlFlow([
            "Chunk['|Const|'][ConstLen] = arg;",
            "ConstLen = ConstLen + 1;",
        ])}
    end
elseif (current == '__proto__') then
    local fix;
    fix = function(whatfix)
        local const = {};
        local constL = 0;
        for i = 1, #whatfix["|Const|"] do
            local v = whatfix["|Const|"][i]
            if (type(v) == "table") then
                integritycheckchartbl()
                const[constL] = {
                    XORStringSec(v[1])
                };
                constL = constL + 1
            else
                const[constL] = v
                constL = constL + 1
            end;
        end;
        const[-1] = constL
        whatfix['|Const|'] = const;
        --
        local inst = {};
        local instL = 1;
        for i = 1, #whatfix["|Inst|"] do
            local v = whatfix["|Inst|"][i]
            inst[instL] = v
            instL = instL + 1
        end
        inst[-1] = instL
        whatfix['|Inst|'] = inst
        --
        local proto = {};
        local protoL = 0;
        for i = 1, #whatfix["|Proto|"] do
            proto[protoL] = fix(whatfix["|Proto|"][i])
            protoL = protoL + 1
        end
        whatfix["|Proto|"] = proto
        whatfix["|Proto|"][-1] = protoL

        return whatfix
    end
    local arg1 = fix(arg)
    Chunk["|Proto|"][ProtoLen] = arg1;
    ProtoLen = ProtoLen + 1;
elseif (current == '__init__') then
    while (arg > -1) do
        Chunk[A] = Chunk[A] or {};
        Chunk[B] = Chunk[B] or {};
        Chunk[C] = Chunk[C] or {};
        Chunk['|Args|'] = Chunk['|Args|'] or D;
        arg = (arg * -1) - (50);
    end
end
return self;
end;`
            ]

        print("adding metamethods")
        Metamethods = shuffleArray(Metamethods)
        s += Metamethods[0]
        s += Metamethods[1]

        
        s += `};`
        
        print("creating main loop")
        let runStr = `local function Run(_, ...)
        if (isClosure ~= true and ran) then
            return error('Already ran (2)!')
        else
            ran = true
        end
        
        --[[if (isClosure ~= true and (size_constinst[1] ~= ConstLen)) then
            return
        elseif (isClosure ~= true and (size_constinst[2] ~= (InstLen - 1))) then
            return
        end--]]
        
        local pc, Top = 1, -1
        local GStack = {}
        local Stack = setmetatable({}, {
            ["__index"] = GStack,
            ["__newindex"] = function(_, Key, Value)
                if (Key > Top) then
                    Top = Key;
                end;
                GStack[Key] = Value;
            end;
        });
        
        local Vararg, Varargsz = {}, gfenv()["select"]('#', ...) - 1;
        local Args = {...};
        
        for Idx = 0, Varargsz do
            if (Idx >= Chunk['|Args|']) then
                Vararg[Idx - Chunk['|Args|']] = Args[Idx + 1];
            else
                Stack[Idx] = Args[Idx + 1];
            end;
        end;
        
        local function Loop()
            local ChunkConst = Chunk['|Const|'];
            while true do
                local ${shuffleArray([
                    "Inst", "OP_CODE", "a", "b", "c"
                ]).join(', ')};
                Inst = Chunk['|Inst|'][pc];
                ${shuffleArray([
                    "OP_CODE = Inst['|Opcode|'];",
                    //"a = |A|;",
                    //"b = |B|;",
                    //"c = |C| or nil;",
                    "pc = pc + 1"
                ]).join('\n')}
  
                -- fat trash debug
                local t = tostring;
                --print(("IGNORE:[%s]\t%s\t|\t%s\t:\t%s\t:\t%s"):format(t(pc - 1), t(enum), t(a), t(b), t(c)));
        `
                
                print("creating fake opcodes")
                let fakeOpcodes = settings.Debug === true ? 0 : Math.floor((Object.keys(tree.Chunk.UsedInstructions).length + 2) / 1.2)
                let fakeLines = [
                    // Xor shit
                    "Stack[|A|] = xorStr(Chunk['|Const|'][|B|], xorPrimaryKey);",
                    "Chunk['|Const|'][i] = xorStr(v[1], xorPrimaryKey)",
                    "for i,v in pairs(Chunk['|Const|']) do if (type(v) == 'table' and type(v[1]) == 'string') then Chunk['|Const|'][i] = xorStr(v[1], xorPrimaryKey) end end;",
                    "Stack[|A|] = Env[XORStringPrim(Chunk['|Const|'][|B|])];",
                    "Stack[|A|] = XORStringPrim(Chunk['|Const|'][|B|]);",
                    "Env[XORStringPrim(Chunk['|Const|'][|B|])] = Stack[|A|];",

                    // Really shit shit
                    "Inst[5] = Chunk['|Const|'][Inst[5]];",
                    "local Upvalues = Chunk['|Const|'][|A| + |C|]; Stack[|A|]	= Upvalues[|B|];",
                    "Stack[|A|] = Env[Chunk['|Const|'][|B|]](|INST_LOAD_VAR|);",
                    "Env[Chunk['|Const|'][|B|]]	= Stack[|A|];",
                    "Stack[|A|]	= { sub((|INST_LOAD_VAR|), 1, Stack[|B|]) };",
                    "_Returns(Stack[|A|](unpack(args, 1, limit - |A|, (|INST_LOAD_VAR|))));",
                    "do return Stack[|C|] end",
                    "for i = Stack[|B|], Stack[|A|] do Stack[|C|] = Stack[|C|] .. Stack[Chunk['|Const|']][i] end;",
                    "if (_Returns(Stack[|A|]) == |INST_LOAD_VAR|) then Chunk['|Opcode|'] = (function(a) return a ^ '__const__' end)('__init__'); end; do InstrPoint = InstrPoint + 1 end",
                    "InstrPoint = InstrPoint - 1;",
                    "local Stk = Stack;local B = |B|;local K = Stk[B];for Idx = B + 1, |C| do K = K .. Stk[Idx]; end;Stack[|A|] = K; Stack[|B|] = |INST_LOAD_VAR|;",
                    "Stack = |B| % Stack[|B|] * |A|;",
                    "InstrPoint = InstrPoint - 1 * (Chunk['|Inst|']); Chunk['|Opcode|']((function(a) return a ^ '__const__' end)('__init__'));",
                    "Chunk['|Const|'] = |B| / { [|A|] = '__value__', [|C|] = |INST_LOAD_VAR| };",
                    "|INST_LOAD_VAR| = sub(Chunk[Stack[|A|]], Stack[|B|], Stack[|C|])"
        
                ]
                

                let fastFakeLines = [ ]

                let fakeCode = []
                for (let i = 0; i < 20; i++) {
                    let s = []
                    let f = Math.floor(Math.random() * 9 + 5)
                    for (let i = 0; i < f; i += 2) {
                        s.push(`\n${shuffleArray(fakeLines)[0]}`)
                    }
                    let f2 = Math.floor(Math.random() * 9 + 3)
                    if (fastFakeLines[0] !== null && fastFakeLines[0] !== undefined)
                        for (let i = 0; i < f2; i += 2)
                            s.push(`\n${shuffleArray(fastFakeLines)[0]}`)
                    fakeCode.push(s.join('\n'))//settings.Debug === true ? s.join('\n') : createControlFlow(s))
                }
        
                print("finiding used instructions")
                let usedOpcodes = []
                for (let opcode in tree.Chunk.UsedInstructions) {
                    usedOpcodes.push( tree.Opmap[isFinite(opcode) ? parseInt(opcode, 10) : opcode ])
                }

                //console.log("AY:", tree.Chunk.Virtuals)
                for (let virtual of tree.Chunk.Virtuals) {
                    usedOpcodes.push(virtual)
                }
        
                print("adding fake opcodes to opmap")
                for (let i = 0; i < fakeOpcodes; i++) {
                    usedOpcodes.push({
                        fake: true,
                        name: `${genUniString(12)}`
                    })
                }
                usedOpcodes = shuffleArray(usedOpcodes)
    
                print("creating logic and control flow for main loop")
                runStr += CreateOpcodeStat(usedOpcodes, fakeCode, tree, settings.Debug)
                runStr += `\nif (pc > (InstLen - 1)) then
                        break
                    end
                end
            end
            local Result1, Result2 = Loop()
            if Result1 and (Result2 > 0) then
                return unpack(Result1, 1, Result2)
            end
    
            return
        end;`;

        s += runStr;

        s += `\nreturn setmetatable({}, Metamethods_), Run\nend;`

        print("adding end of wrapper")
        s += `
local VM, Wrapper = new("${tree.Headers.Signature}", {${tree.Chunk.Const.length}, ${tree.Chunk.Instr.length}}, ${tree.Chunk.Upvals}, gfenv());
VM.__init__(0, '|Const|', '|Inst|', '|Proto|', ${tree.Chunk.Args})
        `


        print("adding btcode deserializer")
        


        s += ``
        //createControlFlow([ ])


        print("creating used constants")
        let cnstLoadCode = [ ` local _CONST = VM["__const__"];` ]
        for (let idx in tree.Chunk.Const) {
            let cnst = tree.Chunk.Const[idx]
            let code = ''
            //console.log(typeof cnst, cnst.constructor === Array, cnst)
            if (typeof cnst === 'object' && cnst !== null && cnst.Encrypted == true && (cnst.Type !== null && cnst.Type !== undefined)) {
                if (cnst.Type === 'number')
                    code += ` VM({${cnst.Orig}});\n`;
                else
                    code += ` VM("IGNORE:${toEscStr( xorStrArr( cnst.Data, tree.XORSecondary ) )}")();\n`;
            } else if(typeof cnst === 'object' && cnst !== null && cnst !== undefined && cnst.constructor === Array) {
                code += ` VM("IGNORE:${toEscStr(cnst)}");\n`;
            } else if(typeof cnst === 'number') {
                code += ` VM({${cnst}});\n`;
            } else if(typeof cnst === 'boolean') {
                code += ` VM(${cnst.toString()});`
            } else if(typeof cnst === 'string') {
                code += ` VM('IGNORE:${toEscStrF(cnst)}');\n`
            } else if(cnst === null) {
                code += ` VM({nil});\n`
            } else {
                code += ` VM('IGNORE:${cnst}');\n`
            }
            cnstLoadCode.push(code)
        }

        print("creating used instructions")
        let [ instLoad_Code, inst_loadSrc ] = CreateInstDecoder(tree.Chunk, tree, settings)
        let instrLoadCode = [
            instLoad_Code
        ]

        print("creating used protos")
        let protoLoadCode = [ ` local _PROTO = VM["__proto__"];`]
        let getProtoLoadCode
        getProtoLoadCode = function(proto) {
            let consts = []
            for (let idx in proto.Const) {
                let cnst = proto.Const[idx]
                //console.log(typeof cnst, cnst.constructor, cnst)
                if (typeof cnst === 'object' && cnst !== null && cnst.Encrypted === true && (cnst.Type !== null && cnst.Type !== null && cnst.Type !== undefined)) {
                    if (cnst.Type === 'number')
                        consts.push(`${cnst.Orig}`);
                    else
                        consts.push(`{"IGNORE:${toEscStr( xorStrArr( cnst.Data, tree.XORSecondary ) )}"}`);
                } else if(typeof cnst === 'object' && cnst !== null && cnst !== undefined && cnst.constructor === Array) {
                    consts.push(`"IGNORE:${toEscStr(cnst)}"`);
                } else if(typeof cnst === 'number') {
                    consts.push(`${cnst}`);
                } else if(typeof cnst === 'boolean') {
                    consts.push(`${cnst}`);
                } else if(cnst === null || cnst === undefined) {
                    consts.push(`nil`);
                } else if(typeof cnst === 'string') {
                    consts.push(`'IGNORE:${toEscStrF( cnst )}'`);
                } else {
                    consts.push(`'${cnst}'`);
                }
            }

            let instructs = []
            for (let idx in proto.Instr) {
                let inst = proto.Instr[idx]
                instructs.push(`{ ['|Opcode|'] = "${inst.Enum}", ${inst['1'] !== null ? inst['1'] : 0}, ${inst['2'] !== null ? inst['2'] : 0}, ${inst['3'] !== null ? `${inst['3']} ,` : ''} ["__value__"] = ${inst.Value} }`)
            }

            let protos = []
            for (let idx in proto.Proto) {
                let pr = proto.Proto[idx]
                protos.push(getProtoLoadCode(pr))
            }

            return `{
                ["|Const|"] = { ${consts.join(',\n')} },
                ["|Inst|"] = { ${instructs.join(',\n')} },
                ["|Proto|"] = { ${protos.join(';\n')} },
                ["|T_UPVALS|"] = ${proto.Upvals},
                ["|Args|"] = ${proto.Args}
            }`
        }


        for (let idx in tree.Chunk.Proto) {
            let proto = tree.Chunk.Proto[idx]
            let str = getProtoLoadCode(proto)
            protoLoadCode.push(`VM (${str})`)
        }

        print("adding consts, insts, & protos")
        let cnstLoadSrc = cnstLoadCode.join('\n')/* settings.Debug === true ? cnstLoadCode.join('\n') : (() => {
            let str = ''
            while (cnstLoadCode.length !== 0) {
                let co = []
                for (let i = 0; i < 50; i++) {
                    let s = cnstLoadCode.shift()
                    if (s != null) {
                        co.push( s )
                    } else {
                        break
                    }
                }
                str += `\ndo\n${createControlFlow(co)}\nend;`
            }
            return str
        })();/**/
        cnstLoadSrc = `\ndo\n${cnstLoadSrc}\nend;`
        let instrLoadSrc = instrLoadCode.join('\n')/* settings.Debug === true ? instrLoadCode.join('\n') :(() => {
            let str = ''
            while (instrLoadCode.length !== 0) {
                let co = []
                for (let i = 0; i < 100; i++) {
                    let s = instrLoadCode.shift()
                    if (s != null) {
                        co.push( s )
                    } else {
                        break
                    }
                }
                str += `\ndo\n${createControlFlow(co)}\nend;`
            }
            return str
        })();/**/
        instrLoadSrc = `\ndo\n${instrLoadSrc}\nend;`
        let protoLoadSrc = protoLoadCode.join('\n')/* settings.Debug === true ? protoLoadCode.join('\n') : (() => {
            let str = ''
            while (protoLoadCode.length !== 0) {
                let co = []
                for (let i = 0; i < 100; i++) {
                    let s = protoLoadCode.shift()
                    if (s != null) {
                        co.push( s )
                    } else {
                        break
                    }
                }
                str += `\ndo\n${createControlFlow(co)}\nend;`
            }
            return str
        })();/**/
        protoLoadSrc = `\ndo\n${protoLoadSrc}\nend;`

        if (Math.random() > 0.5) {
            s += cnstLoadSrc
            s += instrLoadSrc
            s += protoLoadSrc
        } else {
            s += instrLoadSrc
            s += cnstLoadSrc
            s += protoLoadSrc
        }

        print("adding end of obfuscator")
        s += `\nreturn Wrapper(gfenv());` // Run vm

        let amountOfArgs = Math.floor((Math.random() * 25) + 20);
        s = `${watermarkStart}\nreturn (function(__ARG__) 
            local ${shuffleArray([ 'Environment', 'watermark', 'amountOfArgs' ]).join(', ')};
            amountOfArgs = (amountOfArgs or 0);
            for i,v in pairs(__ARG__) do
                amountOfArgs = (amountOfArgs or 0) + 1
            end

            if (amountOfArgs < 2) then
                return ("IGNORE:${genString(Math.floor(Math.random() * 20))}")
            end

            ${createControlFlow(shuffleArray([
                'Environment = __ARG__[1];',
                'watermark = __ARG__[2];'
            ]))}
            ${s}
        end)({
            ${(() => {
                let a = [
                    '[1] = gfenv();',
                    '[2] = WATERMARK;',
                ]
                for (let i = 0; i < (amountOfArgs / 3); i++)
                    a.push(`["IGNORE:${genString(Math.floor((Math.random() * 30) + 2))}"] = "IGNORE:${genString(Math.floor((Math.random() * 20) + 8))}";`)
                for (let i = 0; i < (amountOfArgs / 3); i++)
                    a.push(`[${Math.random() * 400 + 10}] = "IGNORE:${genString(Math.floor((Math.random() * 20) + 8))}";`)
                for (let i = 0; i < (amountOfArgs / 3); i++)
                    a.push(`[${Math.random() * 250 + -300}] = "IGNORE:${genString(Math.floor((Math.random() * 20) + 8))}";`)
                

                return shuffleArray(a).join('\n')
            })()}
        });\n`

        print("replacing dynamic variables")

        //s = s.split('|BYTECODE|').join(BytecodeLib.Encoder.dump_tree(tree))
        s = s.split('|INST_LOAD_VAR|').join(settings.Debug === true ? '__instLoadVar__' : genUniString())
        s = s.split('|INST_LOAD_SRC|').join(`"IGNORE:${inst_loadSrc}"`)

        let instIdx = [ ]
        for (let i = 0; i < 3; i++) {
            let a
            do {
                a = (Math.random() * 10000) // Math.floor
            } while (instIdx.includes(a))
            instIdx.push(i + 1)//a)
        }

        s = s.split('|A|').join(`Inst[${instIdx[0]}]`)
        s = s.split('|B|').join(`Inst[${instIdx[1]}]`)
        s = s.split('|C|').join(`Inst[${instIdx[2]}]`)
        s = s.split('|Bx|').join(`Inst[${instIdx[1]}]`)
        s = s.split('|sBx|').join(`Inst[${instIdx[1]}]`)

        s = s.split('|AIdx|').join(`${instIdx[0]}`)
        s = s.split('|BIdx|').join(`${instIdx[1]}`)
        s = s.split('|CIdx|').join(`${instIdx[2]}`)
        s = s.split('|BxIdx|').join(`${instIdx[1]}`)
        s = s.split('|sBxIdx|').join(`${instIdx[1]}`)
        // |OP_MOVE|
        // |OP_GETUPVAL|
        s = s.split('|OP_MOVE|').join(tree.Opmap[opdata.Opnames.indexOf('MOVE')])
        s = s.split('|OP_GETUPVAL|').join(tree.Opmap[opdata.Opnames.indexOf('GETUPVAL')])
        s = s.split('|OP_CLOSURE|').join(tree.Opmap[opdata.Opnames.indexOf('CLOSURE')])


        s = s.split('|Inst|').join(settings.Debug === true ? 'inst' : genUniString())
        s = s.split('|Opcode|').join(settings.Debug === true ? 'opcode' : genUniString())
        s = s.split('|Const|').join(settings.Debug === true ? 'const' : genUniString())
        s = s.split('|Proto|').join(settings.Debug === true ? 'proto' : genUniString())
        s = s.split('__instr__').join(settings.Debug === true ? '__instr__' : genUniString())
        s = s.split('__const__').join(settings.Debug === true ? '__const__' : genUniString())
        s = s.split('__init__').join(settings.Debug === true ? '__init__' : genUniString())
        s = s.split('__value__').join(settings.Debug === true ? '__value__' : genUniString())
        s = s.split('|Enum|').join(settings.Debug === true ? 'enum' : genUniString())
        s = s.split('|Value|').join(settings.Debug === true ? 'value' : genUniString())
        s = s.split('|T_UPVALS|').join(settings.Debug === true ? 't_upvals' : genUniString())
        s = s.split('|Args|').join(settings.Debug === true ? 'args' : genUniString())
        
        s = s.split('InstrPoint').join('pc')

        s = s.split('|Signature|').join(tree.Headers.Signature)
        s = s.split('|Watermark|').join(settings.Watermark)
        s = s.split('|Base_64_Str|').join(tree.B64Key)
        s = s.split('OP_CODE').join('enum')

        s = s.split('|WatermarkXORTable|').join(`{${xorStrArr(settings.Watermark, tree.XORSecondary).join(', ')}}`)
        s = s.split('|WatermarkXORString|').join(`"IGNORE:${toEscStr(xorStrArr(settings.Watermark, tree.XORSecondary))}"`)
    

        let replaceWords = {
            'Stringbyte': settings.Debug === true ? 'Stringbyte' : genUniString(),
            'Stringsub': settings.Debug === true ? 'Stringsub' : genUniString(),

            'ADD': settings.Debug === true ? 'ADD' : genUniString(),
            'SUB': settings.Debug === true ? 'SUB' : genUniString(),
            'MUL': settings.Debug === true ? 'MUL' : genUniString(),
            'DIV': settings.Debug === true ? 'DIV' : genUniString(),
            'MOD': settings.Debug === true ? 'MOD' : genUniString(),
            'POW': settings.Debug === true ? 'POW' : genUniString(),

            'EQ': settings.Debug === true ? 'EQ' : genUniString(),
            'LT': settings.Debug === true ? 'LT' : genUniString(),
            'LE': settings.Debug === true ? 'LE' : genUniString(),

            'UNM': settings.Debug === true ? 'UNM' : genUniString(),
            'NOT': settings.Debug === true ? 'NOT' : genUniString(),
            'LEN': settings.Debug === true ? 'LEN' : genUniString(),

            'CONCATSTRING': settings.Debug === true ? 'CONCATSTRING' : genUniString(),
            'CONCATTABLE': settings.Debug === true ? 'CONCATTABLE' : genUniString()
        }

        for (let a of Object.entries(replaceWords)) {
            //s = s.split(`|${a[0]}|`).join(a[1])
            //console.log(a)
        }


        // Replace all strings
        let tableStr = ``
        if (settings.CreateConstTable !== false) {
            print("replacing strings and adding to index table")
            let indexes = { }
            let arr = []
            s = settings.Debug === true ? s : s.replace(/['"]([\W\w]*?)['"]/gm, (x) => {
                if (x.match(/^["']IGNORE:/) !== null)
                    return x;

                let name = indexes[x]
                if (name === undefined || name === null) {
                    do {
                        name = `_${genString(Math.floor(Math.random() * 11) + 5)}`
                    } while (indexes[name] != undefined)
                    indexes[x] = name
                    //let delimiter = x.substr(0, 1)
                    let text = x.substr(1, x.length - 2)
                    
                    arr.push(
                        `CONST_TABLE[XORStringSec("${toEscStr(xorStrArr(name, tree.XORSecondary))}")] = XORString("${toEscStr(xorStrArr(text, tree.XORSecondary))}", xorSecondaryKey);`
                    )
                }

                return `(CONST_TABLE.${name})`
            })

            s = s.split('IGNORE:').join('')

            print("adding strings to const table")
            //let arr = []
            /*for (let name in indexes) {
                let obj = indexes[name]
                arr.push(
                    `CONST_TABLE[XORStringSec("${toEscStr(xorStrArr(name, tree.XORSecondary))}")] = XORString("${toEscStr(xorStrArr(text, tree.XORSecondary))}", xorSecondaryKey);`
                )
            }*/
            arr = shuffleArray(arr)


            print("creating constant table")
            print("ctablesize: " + arr.length)
            while (arr.length !== 0) {
                let co = []
                for (let i = 0; i < 5000; i++) {
                    let s = arr.shift()
                    if (s != null) {
                        co.push( s )
                    } else {
                        break
                    }
                }
                tableStr += `\ndo\n${true ? co.join('\n') :  createControlFlow(co)}\nend;`
            }

            tableStr = `
            do
                local setmetatable = gfenv()[XORStringSec("${toEscStr(xorStrArr('setmetatable', tree.XORSecondary))}")];
                if (setmetatable ~= nil) then -- just incase they got some shit lua version
                    CONST_TABLE[XORStringSec("${toEscStr(xorStrArr(mtIdxStr, tree.XORSecondary))}")] = setmetatable({
                        ${(function() {
                            let a = []
                            let l = Math.floor(Math.random() * 5) + 2
                            for (let i = 0; i < l; i++) {
                                a.push(`[${Math.random() * 500 + -250}] = ${Math.random() * 200 + -100};`)
                            }
                            return a.join('\n')
                        })()}
                    }, {
                        [XORStringSec("${toEscStr(xorStrArr('__tostring', tree.XORSecondary))}")] = function(a, b)
                            return (function()
                                while true do
                                    CONST_TABLE = CONST_TABLE or nil;
                                    if (CONST_TABLE ~= nil and CONST_TABLE[1] ~= nil) then
                                        break
                                    else
                                        CONST_TABLE["${toEscStrF(genString(Math.floor(Math.random() * 15) + 10))}"] = "${toEscStrF(genString(Math.floor(Math.random() * 15) + 10))}";
                                    end
                                end;
                                
                                return "${toEscStrF(genString(Math.floor(Math.random() * 30) + 15))}";
                            end)();
                        end;
                    });
                    CONST_TABLE[1] = CONST_TABLE[constMTableIndex];
                end;
                ${tableStr}
            end;`
        } else {
            s = s.split('IGNORE:').join('')
        }
        s = s.split('|ConstantTable|').join(`{ };${tableStr}`)
        print("returning generated code")

        return s
    }
}