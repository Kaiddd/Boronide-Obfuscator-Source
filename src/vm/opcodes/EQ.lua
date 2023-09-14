local Stk = Stack;
local Inst4, Inst5 = Inst[4], Inst[5];

if (Inst4 == nil) then
    if (|B| >= 256) then
        Inst4 = |B| - 256;
        Inst4 = ChunkConst[Inst4];
        Inst[4] = Inst4;
    end
end

if (Inst5 == nil) then
    if (|C| >= 256) then
        Inst5 = |C| - 256;
        Inst5 = ChunkConst[Inst5];
        Inst[5] = Inst5;
    end
end

local B = Inst4 or Stk[|B|];
local C = Inst5 or Stk[|C|];

if (B == C) ~= |A| then
    InstrPoint	= InstrPoint + 1;
end;