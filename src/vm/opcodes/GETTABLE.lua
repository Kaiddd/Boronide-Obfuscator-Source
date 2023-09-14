if (|C| >= 256) then
    Inst[5] = |C| - 256
    Inst[5] = Chunk['|Const|'][Inst[5]]
end

local Stk	= Stack;
Stk[|A|]	= Stk[|B|][Inst[5] or Stk[|C|]];