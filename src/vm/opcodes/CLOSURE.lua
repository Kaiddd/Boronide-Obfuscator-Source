local NewProto	= Chunk['|Proto|'][|B|];
local Stk	= Stack;

local Indexes;
local NewUvals;

if (NewProto["|T_UPVALS|"] ~= 0) then
    Indexes		= {};
    NewUvals	= setmetatable({}, {
            ["__index"] = function(_, Key)
                local Val	= Indexes[Key];

                return Val[1][Val[2]];
            end,
            ["__newindex"] = function(_, Key, Value)
                local Val	= Indexes[Key];

                Val[1][Val[2]]	= Value;
            end;
        }
    );

    for Idx = 1, NewProto['|T_UPVALS|'] do
        local Mvm	= Chunk['|Inst|'][InstrPoint];
        if (Mvm["|Opcode|"] == "|OP_MOVE|") then -- MOVE
            Indexes[Idx - 1] = { Stk, Mvm[|BIdx|] };
        elseif (Mvm["|Opcode|"] == "|OP_GETUPVAL|") then -- GETUPVAL
            Indexes[Idx - 1] = { Upvalues, Mvm[|BIdx|] };
        end;

        InstrPoint	= InstrPoint + 1;
    end;

    Lupvals[#Lupvals + 1]	= Indexes;
end;

local f, _fr = new(0, "|OP_CLOSURE|", NewProto, Env, NewUvals);
f.__init__(0, '|Const|', '|Inst|', '|Proto|', Chunk['|Args|']);
Stk[|A|] = function(...)
    return _fr(f, ...);
end;