                    if (pc > (InstLen - 1)) then
                        break
                    end
                end
            end)
            
            if (not Success) then
                return error(Result) and false
            else
                return true
            end
        end,
    })
end
