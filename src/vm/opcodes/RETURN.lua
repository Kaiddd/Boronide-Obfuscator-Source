local A	= |A|;
local B	= |B|;
local Stk = Stack;
local Edx, Output;
local Limit;

if (B == 1) then
    return;
elseif (B == 0) then
    Limit	= Top;
else
    Limit	= A + B - 2;
end;

Output = {};
Edx = 0;

for Idx = A, Limit do
    Edx	= Edx + 1;
    Output[Edx] = Stk[Idx];
end;
do
    return Output, Edx;
end