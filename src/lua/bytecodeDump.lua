local function assert(a, b)
    if not a then
        return error(b)
    end
end


local inputName = ({...})[1]
assert(inputName, 'missing first argument')
local inputFile = io.open(inputName, 'rb')
assert(inputFile, 'no input file')
local inputContent = inputFile:read("*all")
inputFile:close()

local f = loadstring(inputContent)
assert(f, "not a valid function")
local bytecode = string.dump(f)
local outputName = ({...})[2]
assert(outputName, "missing second argument")
local outputFile = io.open(outputName, 'wb')
assert(outputFile, "second argument not existing")

--[[local a = ''
bytecode:gsub('.', function(b)
    local hex = string.format('%x', b:byte()):upper()
    a = a .. ('0'):rep(2 - #hex) .. hex
end)--]]

outputFile:write(bytecode)
outputFile:close()
