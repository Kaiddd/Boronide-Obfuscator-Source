local B = Stack[|B|];

if |C| then 
    if B then
        InstrPoint = InstrPoint + 1;
    else 
        Stack[|A|] = B
    end
elseif B then
    Stack[|A|] = B
else 
    InstrPoint = InstrPoint + 1;
end