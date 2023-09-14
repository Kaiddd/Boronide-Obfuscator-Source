local function error(...)
    print('error', ...)
    return setmetatable({}, {
        __index = function(self, ...) return self end;
        __sub = function(self, ...) return self end;
        __call = function(self, ...) return self end;
    })
end