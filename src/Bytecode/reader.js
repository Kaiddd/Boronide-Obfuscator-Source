// Read the bytecode

function bits(d) {
    let a = (d >>> 0).toString(2)
    return `${(8 - a.length) <= 0 ? '' : ('0').repeat(8 - a.length)}${a}`
}

module.exports = class Reader {
    constructor(bytes) {
        this.bytes = bytes
        this.gSizet = null
        this.gInt = null
        this.pos = 0
    }

    gAscii(len = 1) {
        let nums = []
        for (let i = 0; i < len; i++) {
            nums.push(this.bytes[this.pos])
            this.pos += 1
        }
        return nums  
    }

    gBits32from(a) {
        return (a[0] * 1)
            + (a[1] * 256) 
            + (a[2] * 65536) 
            + (a[3] * 16777216)
    }

    read(len = 1) {
        let str = ''
        for (let i = 0; i < len; i++) {
            str += String.fromCharCode(this.gAscii()[0])
        }
        return str
    }

    gBits8() {
        return this.gAscii()[0]
    }

    gBits32() {
        let [ W, X, Y, Z ] = this.gAscii(4)
        return (W * 1)
            + (X * 256)
            + (Y * 65536)
            + (Z * 16777216)
    }

    gBits64() {
        return this.gBits32() * 4294967296 + this.gBits32()
    }

    gByte8() {
        return this.gBits32() + this.gBits32() // not an integer
    }

    gFloat() {
        let Left = this.gBits32()
        let [ A, B, C, D ] = this.gAscii(4)
        let Right = this.gBits32from([A, B, C, D])
        let IsNormal = 1
        let RightBits = `${bits(D)}${bits(C)}${bits(B)}${bits(A)}`
        let Mantissa = (parseInt(RightBits.substr(12, 20), 2) 
            * (2 ** 32)) + Left
        let Exponent = parseInt(RightBits.substr(1, 11), 2)
        let Sign = ((-1) ** parseInt(RightBits.substr(0, 1), 2))

        if (Exponent == 0) {
            if (Mantissa == 0) {
                return Sign * 0
            } else {
                Exponent = 1
                IsNormal = 0
            }
        } else if(Exponent == 2047) {
            if (Mantissa == 0) {
                return Sign * (1 / 0)
            } else {
                return Sign * (0 / 0)
            }
        }

        return (Sign * (2 ** (Exponent - 1023))) * (IsNormal + (Mantissa / (2 ** 52)))
    }

    gString(Len = this.gSizet()) {
        return Len == 0 ? '' : this.read(Len)
    }
}