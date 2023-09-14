local insts = {
    [0] = {
        enum = 4, -- loadk
        A = 0,
        B = 0
    },
    [1] = {
        enum = 1,
        A = 0,
        B = 0
    },
    [2] = {
        enum = 4,
        A = 1,
        B = 1 
    },
    [3] = {
        enum = 10,
        A = 0, 
        B = 1
    }
}
local consts = {[0] = 'print', [1] = 'scream'}
local stack = {}

for i = 0, #insts do
    local inst = insts[i]
    local enum = inst.enum
    local A = inst.A
    local B = inst.B or inst.Bx
    local C = inst.C or nil
    if enum == 1 then
        stack[B] = getfenv()[stack[A]]
    elseif enum == 2 then
        stack[B] = stack[A]
    elseif enum == 3 then
        stack[C] = stack[A][stack[B]]
    elseif enum == 4 then
        stack[B] = consts[A]
    elseif enum == 5 then
        -- call

        stack[C] = stack[A](
            stack[A + B - 1]
        )
    elseif enum == 6 then
        stack[C] = stack[A] .. stack[B]
    elseif enum == 7 then
        -- set
        stack[B][stack[C]] = stack[A]
    elseif enum == 8 then
        -- wrap, wtf
    elseif enum == 9 then
        return --OP_RETURN
    elseif enum == 10 then
        getfenv()[stack[B]] = stack[A]
    end
end

--scream'Hello World!' 