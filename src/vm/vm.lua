

local function error(...)
    print('error', ...)
    return setmetatable({}, {
        __index = function(self, ...) return self end;
        __sub = function(self, ...) return self end;
        __call = function(self, ...) return self end;
    })
end


local Chunk
local function new(size_constinst)
    local current
    local last
    local ran = false
    local InstLen, ConstLen = 0, 0
    local Env = getfenv()
    return setmetatable({}, {
        __index = function(self, index)
            if (ran) then
                while (1 == 1 and ran == (#Chunk > -1)) do
                    Chunk[index] = '\0'
                end
                return
            elseif (Chunk == nil) then
                Chunk = {}
            end
            if (index == '__instr__') then
                current = index
            elseif (index == '__const__') then
                current = index
            elseif (index == '__init__') then
                current = index
            else
                return error('invalid index!')
            end
            return self
        end,
        __call = function(self, arg, A, B)
            if (ran) then
                return error('Already ran!')
            end
            if (current == '__instr__') then
                if (last) then
                    Chunk['|inst|'][InstLen] = { ['|opcode|'] = last, unpack(arg) }
                    InstLen = InstLen + 1
                    last = nil
                else
                    last = arg
                end
            elseif (current == '__const__') then
                if (arg == nil) then
                    Chunk['|const|'][ConstLen] = { arg } -- Encrypted
                else
                    Chunk['|const|'][ConstLen] = arg
                    ConstLen = ConstLen + 1
                end
            elseif (current == '__init__') then
                while (arg > -1) do
                    Chunk[A] = {}
                    Chunk[B] = {}
                    arg = (arg * -1) - (50)
                end
            end
            return self;
        end,
        __sub = function(_, values)
            if (ran) then
                return error('Already ran!')
            else
                ran = true
            end

            if (size_constinst[1] ~= ConstLen) then
                print('1 : fail', values[1], ConstLen)
            elseif (size_constinst[2] ~= InstLen) then
                print('2 : fail', values[2], InstLen)
            end

            local Success, Result = pcall(function()
                local Stack = {}
                local pc = 0
                while true do
                    local Inst = Chunk['|inst|'][pc]
                    pc = pc + 1

                    local enum = Inst['|opcode|']
                    local a,b,c
                    a = Inst[1]
                    b = Inst[2]
                    c = Inst[3] or nil

                    if enum == 'getglobal' then
                        Stack[a] = Env[Chunk['|const|'][b]]
                    elseif enum == 'loadk' then
                        Stack[a] = Chunk['|const|'][b]
                    elseif enum == 'call' then
                        -- todo
                        local args, limit, edx = {}, 0, 0

                        if (b ~= 1) then
                            if (b ~= 0) then
                                Limit = a + b - 1
                            else
                                Limit = (Stack[0] and #Stack + 1) or #Stack
                            end

                            for Idx = a + 1, (Stack[0] and #Stack + 1) or #Stack do
                                edx = edx + 1
                                args[edx] = Stack[Idx]
                            end

                            Stack[a](unpack(args, 1, ((Stack[0] and #Stack + 1) or #Stack) - 1))
                        else
                            Stack[a]()
                        end
                    elseif enum == 'return' then
                        return
                    end
                    if (pc > (InstLen - 1)) then
                        break
                    end
                end
            end)
            return Success, Result
        end,
    })
end

local success, result = new({2, 4})
.__init__(0, '|const|', '|inst|')
.__const__
'print'()
'Hello World!'()

.__instr__
'getglobal' { 0, 0 }
'loadk' { 1, 1 }
'call' { 0, 0, 1 }
'return' { 0, 1 }

- {}

if (not success) then
    return error(result)
end

