local Stk	= Stack;
local B		= |B|;
local K 	= Stk[B];

for Idx = B + 1, |C| do
    K = K .. Stk[Idx];
end;

Stack[|A|]	= K;