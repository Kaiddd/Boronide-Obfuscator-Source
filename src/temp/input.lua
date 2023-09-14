local a = {
    On = false
}
local b = true

function C(const)
    (function()
        if b and a[const] then
            print("On")
        else
            print("Off")
        end
    end)()
end
for i = 1,1 do
    C('On')
end