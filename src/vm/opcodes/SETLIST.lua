local A		= |A|;
local B		= |B|;
local C		= |C|;
local Stk	= Stack;

if (C == 0) then
    InstrPoint	= InstrPoint + 1;
    C			= Chunk['|Inst|'][InstrPoint]["__value__"];
end;

local Offset	= (C - 1) * 50;
local T			= Stk[A]; -- Assuming T is the newly created table.

if (B == 0) then
    B	= Top - A;
end;

for Idx = 1, B do
    T[Offset + Idx] = Stk[A + Idx];
end;