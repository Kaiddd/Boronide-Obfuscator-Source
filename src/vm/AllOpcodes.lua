--TestShit
local b = "";
local a = {}
print = print or false
local trueShit = function(xx) return xx or true end
local function f()
    b = b or "oye"
    a = a or {b}
    a[1] = a[1] or 'aa'
    return trueShit("Hello world")
end
function a:hey()
    return self
end

function a.hay(...)
    return ...
end

print(f(), a:hey()[1], a.hay("Hey", "Hey2", trueShit(0)))
print(b)


local a,b,c = false, nil, 0
local d, e, f, g, h, i, j = c + 1, 
    c - 1,
    c * 2,
    c / 2,
    c % 2,
    c ^ 2,
    -c * -1,
    #{1, 2, 3},
    f() .. 'aye',
    not f()

print(d, e, f, g, h, i, j)
if a == b or c > d or c >= d or c <= d or c ~= d then
    print("*YO WTF*")
    c = c and b;
end

local _1, _2, _3;
_3 = _1 and _2;
for i = 1, d + 5 do
    print(i)
end

for i,v in pairs({"a", "b", "c"}) do 
    print(i,v)
end

do
    local p,q
    r = function() return p,q end
end

if (r == nil) then
    print("n")
end

print(d)

local a = {b = 'bbbb'}
function a:hay(...)
    print("A:", self.b, ...)
    return ...
end

print("B:", a:hay("Hey", "Hey2"))
