
if (|C| >= 256) then
    Inst[5] = |C| - 256
    Inst[5] = Chunk['|Const|'][Inst[5]]
end

local Stk	= Stack;
local A		= |A|;
local B		= Stk[|B|];
local C		= Inst[5] or Stk[|C|];
Stk[A + 1]	= B;
Stk[A]		= B[C];