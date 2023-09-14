local A	= |A|;
local B	= |B|;
local Stk	= Stack;
local Args, Results;
local Limit;
local Rets = 0;

Args = {};

if (B ~= 1) then
    if (B ~= 0) then
        Limit = A + B - 1;
    else
        Limit = Top;
    end

    for Idx = A + 1, Limit do
        Args[#Args + 1] = Stk[Idx];
    end

    Results = {Stk[A](unpack(Args, 1, Limit - A))};
else
    Results = {Stk[A]()};
end;

for Index in pairs(Results) do -- get return count
    if (Index > Rets) then
        Rets = Index;
    end;
end;
do
    return Results, Rets;
end