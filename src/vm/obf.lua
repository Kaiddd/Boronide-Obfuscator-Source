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
            if (index == 'fadwcg5lqftpwrnhehca4kzw') then
                current = index
            elseif (index == 'cc2bceq7vm9wmvq8ru8frb5a') then
                current = index
            elseif (index == 'bctmgwfjvltp5ut5bjvpk38u') then
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
            if (current == 'fadwcg5lqftpwrnhehca4kzw') then
                if (last) then
                    Chunk[',;lyykuak;@ur3j4bb'][InstLen] = { ['jkwi#fwgcbh;e[k!,h'] = last, unpack(arg) }
                    InstLen = InstLen + 1
                    last = nil
                else
                    last = arg
                end
            elseif (current == 'cc2bceq7vm9wmvq8ru8frb5a') then
                if (arg == nil) then
                    Chunk['k.(yju*w)(_b$z.(ya'][ConstLen] = { arg } -- Encrypted
                else
                    Chunk['k.(yju*w)(_b$z.(ya'][ConstLen] = arg
                    ConstLen = ConstLen + 1
                end
            elseif (current == 'bctmgwfjvltp5ut5bjvpk38u') then
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
                return error('1 : fail', values[1], ConstLen)
            elseif (size_constinst[2] ~= InstLen) then
                return error('2 : fail', values[2], InstLen)
            end

            local Success, Result = pcall(function()
                local Stack = {}
                local pc = 0
                while true do
                    local Inst = Chunk[',;lyykuak;@ur3j4bb'][pc]
                    pc = pc + 1

                    local enum = Inst['jkwi#fwgcbh;e[k!,h']
                    local a,b,c
                    a = Inst[1]
                    b = Inst[2]
                    c = Inst[3] or nil

                    if enum == 'mczi!xv+w%!f[y5#cq@6' then
                        Stack[a] = Env[Chunk['k.(yju*w)(_b$z.(ya'][b]]
                    elseif enum == ':txj#zk2?js!:&u:#,+!' then
                        Stack[a] = Chunk['k.(yju*w)(_b$z.(ya'][b]
                    elseif enum == 'zdtn7{g=ssvf*nlw8kz,' then
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
                    elseif enum == 'b2s=ib%u()+g$lx2x!yu' then
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
.bctmgwfjvltp5ut5bjvpk38u(0, 'k.(yju*w)(_b$z.(ya', ',;lyykuak;@ur3j4bb')
.cc2bceq7vm9wmvq8ru8frb5a
'print'
'Hello World!'

.fadwcg5lqftpwrnhehca4kzw
'mczi!xv+w%!f[y5#cq@6' { 0, 0 }
':txj#zk2?js!:&u:#,+!' { 1, 1 }
'zdtn7{g=ssvf*nlw8kz,' { 0, 0, 1 }
'b2s=ib%u()+g$lx2x!yu' { 0, 1 }

- {}

if (not success) then
    -- result

    return error(result)
end