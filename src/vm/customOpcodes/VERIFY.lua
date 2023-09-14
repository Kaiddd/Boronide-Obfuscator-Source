integritycheckchartbl()
if Stack[|A|] ~= |B| or signature ~= "|Signature|" or watermark ~= XORStringSec(|WatermarkXORString|) then
    InstrPoint = InstrPoint - 1;
    return (function()
        while true do
            signature = Stack[1];
            watermark = Stack[2];
        end;
    end)();
elseif not (Stack[|A|] ~= |B| or signature ~= "|Signature|" or watermark ~= XORStringSec(|WatermarkXORString|)) then
    Stack[|A|] = nil;
    Stack[0] = nil;
    Top = domath(1, -1, '|MUL|');
end;