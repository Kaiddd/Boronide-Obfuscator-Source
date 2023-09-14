function frexp (arg) {
    //  discuss at: https://locutus.io/c/frexp/
    // original by: Oskar Larsson Högfeldt (https://oskar-lh.name/)
    arg = Number(arg)
    const result = [arg, 0]
    if (arg !== 0 && Number.isFinite(arg)) {
      const absArg = Math.abs(arg)
      const log2 = Math.log2 || function log2 (n) { return Math.log(n) * Math.LOG2E }
      let exp = Math.max(-1023, Math.floor(log2(absArg)) + 1)
      let x = absArg * Math.pow(2, -exp)
      while (x < 0.5) {
        x *= 2
        exp--
      }
      while (x >= 1) {
        x *= 0.5
        exp++
      }
      if (arg < 0) {
        x = -x
      }
      result[0] = x
      result[1] = exp
    }
    return result
}

let opdata = require('./opdata.json')
let encoder = {
    from_double: (x) => {
        let grab_byte = (v) => {
            let c = v % 256
            return [ (v - c) / 256, encoder.from_string(String.fromCharCode(c)) ]
        }
        let sign = 0
        if (x < 0) {
            sign = 1
            x = -x
        }
        let [ mantissa, exponent ] = frexp(x)
        if (x == 0) {
            mantissa = 0
            exponent = 0
        } else if(x == 1 / 0) {
            mantissa = 0
            exponent = 2047
        } else {
            mantissa = (mantissa * 2 - 1) * (0.5 * 2 ** 53)
            exponent = exponent + 1022
        }
        let [ v, byte ] = [ '', null ]
        x = Math.floor(mantissa)
        for (let i = 0; i < 6; i++) {
            [ x, byte ] = grab_byte(x);
            byte = v + byte;
        }
        [ x, byte ] = grab_byte(exponent * 16 + x)
        v = v + byte;
        [ x, byte ] = grab_byte(sign * 128 + x)
        v = v + byte;
        return v
    },

    from_int: (x) => {
        let v = ''
        x = Math.floor(x)
        if (x < 0) {
            x = 4294967296 + x
        }
        for (i = 0; i < 4; i++) {
            let c = x % 256
            v = v + encoder.from_string(String.fromCharCode(c))
            x = Math.floor(x / 256)
        }
        return v
    },

    from_string: (s) => {
        let e = ''
        for (let i = 0; i < s.length; i++) {
            let hex = s.substr(i, 1).charCodeAt().toString(16)
            e += `${(2 - hex.length) > 0 ? '0'.repeat(2 - hex.length) : ''}${hex}`
        }
        return e.toUpperCase()
    },

    dump_string: (s) => {
        if (typeof s == 'string') {
            s += '\0'
            return `${encoder.from_int(s.length)}${encoder.from_string(s)}`
        } else {
            return encoder.from_int(0)
        }
    },

    dump_char: (y) => {
        return encoder.from_string(String.fromCharCode(y))
    },

    dump_headers: (headers) => {
        return encoder.from_string(headers.Signature) + 
            + encoder.dump_char(headers.Version)
            + encoder.dump_char(headers.FormatVersion)
            + encoder.dump_char(headers.Endianness)
            + encoder.dump_char(headers.IntSize)
            + encoder.dump_char(headers.Sizet)
            + encoder.dump_char(headers.InstSize)
            + encoder.dump_char(headers.NumSize)
            + encoder.dump_char(headers.IntegralFlag)
    },

    dump_instructions: (insts) => {
        let to_mbits = (n, l = 8) => {
            let s = n.toString(2)
            return `${'0'.repeat(Math.max(0, l - s.length))}${s}`
        }
        let s = ''
        s += encoder.from_int(insts.length)
        for (let Idx = 0; Idx < insts.length; Idx++) {
            let sinst = ''
            let Inst = insts[Idx]
            if (Inst.Enum == 26 || Inst.Enum == 27) {
                Inst[3] = Inst[3] ? 0 : 1
            } else if(Inst.Enum >= 23 && Inst.Enum <= 25) {
                Inst[1] = Inst[1] ? 1 : 0
            }

            let Type
            switch (Inst.Type) {
                case 'ABC':
                    Type = Type || 1
                    sinst += to_mbits(Inst[2], 9)
                    sinst += to_mbits(Inst[3], 9)
                    sinst += to_mbits(Inst[1], 8)
                    break
                case 'ABx':
                    Type = Type || 2
                case 'AsBx':
                    Type = Type || 3
                    sinst += to_mbits(Inst[2], 18)
                    sinst += to_mbits(Inst[1], 8)
                    break
                case 'NOP':
                    Type = Type || 4
                    sinst += to_mbits(Math.floor(Math.random() * 10 + 1), 26)
                    break
                default: break
            }
            sinst += to_mbits(Inst.Enum, 6)

            let [ A, B, C, D ] = sinst.match(/......../g)
            s += encoder.dump_char(parseInt(D, 2))
            s += encoder.dump_char(parseInt(C, 2))
            s += encoder.dump_char(parseInt(B, 2))
            s += encoder.dump_char(parseInt(A, 2))
            s += encoder.dump_char(Type)
            s += encoder.dump_char(parseInt(
                to_mbits(Inst.Mode.b == 'OpArgK' ? 1 : 0, 4) 
                + to_mbits(Inst.Mode.c == 'OpArgK' ? 1 : 0, 4), 
            2))
        }
        return s
    },

    dump_constants: (consts) => {
        let s = ''
        s += encoder.from_int(consts.length);
        for (let Idx = 0; Idx < consts.length; Idx++) {
            let const_ = consts[Idx]
            let type = const_ == null ? 0 
                : typeof const_ == 'boolean' ? 1
                : typeof const_ == 'number' ? 3
                : 4
            s += encoder.dump_char(type)
            switch (type) {
                case 0:
                    break
                case 1:
                    s += encoder.dump_char(_const ? 1 : 0)
                    break
                case 3:
                    s += encoder.from_double(const_)
                    break
                case 4:
                    s += encoder.dump_string(const_)
                    break
                default: break
            }
        }
        

        return s
    },

    dump_protos: (protos, debug) => {
        let s = ''
        s += encoder.from_int(protos.length)
        for (let Idx = 0; Idx < protos.length; Idx++) {
            let proto = protos[Idx]
            s += encoder.dump_chunk(proto, debug)
        }
        return s
    },

    dump_debugdata: (lines, locals, upvalues) => {
        let s = ''

        s += encoder.from_int(lines.length)
        for (let Idx = 0; Idx < lines.length; Idx++) {
            s += encoder.from_int(lines[Idx])
        }

        s += encoder.from_int(locals.length)
        for (let Idx = 0; Idx < locals.length; Idx++) {
            let local = locals[idx]
            s += encoder.from_string(local.Name)
            s += encoder.from_int(local.FirstL)
            s += encoder.from_int(local.LastL)
        }

        s += encoder.from_int(upvalues.length)
        for (let Idx = 0; Idx < upvalues.length; Idx++) {
            s += encoder.from_string(upvalues[Idx])
        } 



        return s
    },

    dump_chunk: (chunk, debug = false) => {
        let s = ''
        if (debug) {
            s += encoder.dump_string(chunk.Name)
            s += encoder.from_int(chunk.FirstL)
            s += encoder.from_int(chunk.LastL)
        }
        s += encoder.dump_char(chunk.Upvals)
        s += encoder.dump_char(chunk.Args)
        if (debug) {
            s += encoder.dump_char(chunk.Vargs)
            s += encoder.dump_char(chunk.Stack)
        }

        s += encoder.dump_instructions(chunk.Instr)
        s += encoder.dump_constants(chunk.Const)
        s += encoder.dump_protos(chunk.Proto, debug)

        if (debug) {
            s += encoder.dump_debugdata(chunk.Lines, chunk.Locals, chunk.Upvalues)
        }

        return s
    },

    dump_tree: (tree, debug) => {
        let bytecode = ''
        let headers = encoder.dump_headers(tree.Headers)
        let chunk = encoder.dump_chunk(tree.Chunk, false)

        bytecode += headers
        bytecode += chunk
        return bytecode
    }
}
module.exports = encoder