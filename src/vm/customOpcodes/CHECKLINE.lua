local _, str = pcall(function() local a = 1 - "abcdefg" ^ 2 return "waa" / a; end)
local Matched = gmatch(tostring(str), ':(%d*):')()
local thisLine = tonumber(Matched)

local wLine = whatLineErr(pcall(function() local a = "b" ^ 2 return "ooa" % a; end))
if (wLine ~= StartLine or StartLine == nil or 
    (type ~= nil and type(StartLine) ~= "number") or wLine ~= thisLine or thisLine ~= StartLine) then
    InstrPoint = domath(InstrPoint, 1, '|SUB|');
    return (function()
        while true do
            InstrPoint = InstrPoint - 1
            if InstrPoint < -100 then
                InstrPoint = 1000
            end
        end
        return "";
    end)()
elseif not (wLine ~= StartLine or StartLine == nil or 
(type ~= nil and type(StartLine) ~= "number") or wLine ~= thisLine or thisLine ~= StartLine) then
    Stack[|A|] = |B|;
end;