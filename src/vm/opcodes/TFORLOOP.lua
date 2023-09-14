local A		= |A|;
local C		= |C|;
local Stk	= Stack;

local Offset	= A + 2;
local Result	= {Stk[A](Stk[A + 1], Stk[A + 2])};

for Idx = 1, C do
    Stack[Offset + Idx] = Result[Idx];
end;

if (Stk[A + 3] ~= nil) then
    Stk[A + 2]	= Stk[A + 3];
else
    InstrPoint	= InstrPoint + 1;
end;