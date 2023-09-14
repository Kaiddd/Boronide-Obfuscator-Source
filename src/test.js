const luamin = require('./minify.js')
const luamin2 = require('./luamin')
const fs = require('fs')

let a = fs.readFileSync('./temp/output-1.lua').toString()
a = luamin.Minify(a, {
    RenameVariables: true,
    RenameGlobals: false,
    SolveMath: false
})

fs.writeFileSync('./temp/a.lua', a)