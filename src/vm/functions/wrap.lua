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

                    --op_check
                    
                    if (pc > (InstLen - 1)) then
                        break
                    end
                end
            end)
            return Success, Result
        end,
    })
end