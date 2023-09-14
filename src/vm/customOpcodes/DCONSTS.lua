for i,v in pairs(Chunk['|Const|']) do
    if (type(v) == 'table' and type(v[1]) == 'string') then
        Chunk['|Const|'][i] = xorStr(v[1], xorDecodeckey)
    end
end