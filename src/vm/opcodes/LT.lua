
local Stk = Stack;


|C| = |C| or false
if (|B| >= 256) then
    Inst[4] = |B| - 256
    Inst[4] = Chunk['|Const|'][Inst[4]]
end

Inst[4] = Inst[4] or false
if (|C| >= 256) then
    Inst[5] = |C| - 256
    Inst[5] = Chunk['|Const|'][Inst[5]]
end

local B = Inst[4] or Stk[|B|];
local C = Inst[5] or Stk[|C|];

if (B < C) ~= |A| then
    InstrPoint	= InstrPoint + 1;
end;