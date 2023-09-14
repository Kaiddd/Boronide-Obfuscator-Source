local A		= |A|;
local Stk	= Stack;

-- As per mirroring the real vm
Stk[A] = assert(tonumber(Stk[A]), '`for` initial value must be a number');
Stk[A + 1] = assert(tonumber(Stk[A + 1]), '`for` limit must be a number');
Stk[A + 2] = assert(tonumber(Stk[A + 2]), '`for` step must be a number');

Stk[A]	= Stk[A] - Stk[A + 2];

InstrPoint	= InstrPoint + |B|;