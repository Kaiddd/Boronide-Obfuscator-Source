local A		= |A|;
local Stk	= Stack;

local Step	= Stk[A + 2];
local Index	= Stk[A] + Step;

Stk[A]	= Index;

if (Step > 0) then
    if Index <= Stk[A + 1] then
        InstrPoint	= InstrPoint + |B|;

        Stk[A + 3] = Index;
    end;
else
    if Index >= Stk[A + 1] then
        InstrPoint	= InstrPoint + |B|;

        Stk[A + 3] = Index;
    end
end