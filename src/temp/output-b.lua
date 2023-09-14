local a = function(b, c, d, e, f, ...)
	if b then
	else
		if f then
			local g = { ... }
			if c == 1 then
				print("a")
			elseif c == 2 then
				print("a")
			elseif c == 3 then
				print("a")
			end
		elseif e then
			if c == 1 then
				print("a")
			elseif c == 2 then
				print("a")
			elseif c == 3 then
				print("a")
			end
		elseif d then
			if c == 1 then
				print("a")
			elseif c == 2 then
				print("a")
			elseif c == 3 then
				print("a")
			end
		end
	end
end
local function h(i)
	for j in i do
		return j
	end
end
local function k(i, ...)
	for l in i, ... do
		return l
	end
end
local m = {
	["|Stringsub|"] = string.sub,
	["|Stringbyte|"] = string.byte,
	["|Assert|"] = assert,
	["|Tonumber|"] = tonumber,
	["|Getfenv|"] = getfenv or function()
		return _ENV
	end,
	["|Next|"] = next,
	["|Unpack|"] = unpack or table.unpack,
	["|Tableconcat|"] = table.concat,
	["|Type|"] = typeof or type,
	["|Mathfloor|"] = math.floor,
	["|Stringchar|"] = string.char,
	["|Getmetatable|"] = getmetatable,
	["|Coroutinewrap|"] = coroutine.wrap,
	["|Coroutineyield|"] = coroutine.yield,
}
local function n(o, p, q)
	k(assert, q, "dm this to Herrtt or Melancholy")
	if q == "|EQ|" then
		return o == p
	elseif q == "|LT|" then
		return o < p
	elseif q == "|LE|" then
		return o <= p
	end
end
local r
local function s(o, p, q)
	k(assert, q, "dm this to Herrtt or Melancholy")
	if n(q, "|MUL|", "|EQ|") then
		return o * p
	elseif n(q, "|DIV|", "|EQ|") then
		return o / p
	elseif n(q, "|ADD|", "|EQ|") then
		return o + p
	elseif n(q, "|SUB|", "|EQ|") then
		return o - p
	elseif n(q, "|MOD|", "|EQ|") then
		return o % p
	elseif n(q, "|POW|", "|EQ|") then
		return o ^ p
	end
end
local function t(o, q)
	k(assert, q, "dm this to Herrtt or Melancholy")
	if n(q, "|UNM|", "|EQ|") then
		return -o
	elseif n(q, "|NOT|", "|EQ|") then
		return not o
	elseif n(q, "|LEN|", "|EQ|") then
		return #o
	end
end
local function u(o, p, q)
	k(assert, q, "dm this to Herrtt or Melancholy")
	if n(q, "|CONCATSTRING|", "|EQ|") then
		return o .. p
	elseif n(q, "|CONCATTABLE|", "|EQ|") then
		return m["|Tableconcat|"](o, p)
	end
end
local function v(w)
	local x = 0
	local y = #w
	for z, j in next, w do
		x = s(x, 1, "|ADD|")
	end
	if t(n(x, y, "|EQ|"), "|NOT|") then
		for z, j in next, w do
			if n(m["|Type|"](z), "number", "|EQ|") and n(z, y, "|LE|") then
				x = s(x, 1, "|ADD|")
			end
		end
	end
	return x
end
local function A()
	if t(n(m["|Getmetatable|"](r), nil, "|EQ|"), "|NOT|") then
		return m["|Coroutineyield|"]()
	end
end
local B = #("This file was obfuscated with herrttfuscator v"):sub(0, 0)
local function C(D)
	local E = {}
	local F, G, H = 0, 0, 0
	for I, j in pairs(D) do
		if n(m["|Type|"](I), "number", "|EQ|") and n(I, m["|Mathfloor|"](I)) then
			G = s(G, 1, "|ADD|")
		else
			F = s(F, 1, "|ADD|")
		end
		H = s(H, 1, "|ADD|")
	end
	E.__newindex = function(w, I, j)
		if n(m["|Type|"](I), "number", "|EQ|") and n(I, m["|Mathfloor|"](I)) then
			G = s(G, 1, "|ADD|")
		else
			F = s(F, 1, "|ADD|")
		end
		H = s(H, 1, "|ADD|")
		w[I] = j
	end
	E.__index = function(w, I)
		if n(I, "|KEYS|", "|EQ|") then
			return F
		elseif n(I, "|INDEXES|", "|EQ|") then
			return G
		elseif n(I, "|TOTAL|", "|EQ|") then
			return H
		end
	end
	return setmetatable(D, E)
end
local function J(w)
	local K = k(v, w)
	local L = 0
	return function()
		L = s(L, 1, "|ADD|")
		if n(L, K, "|LE|") then
			return L, w[L]
		end
	end
end
local function M(N, O)
	for z, j in pairs(O) do
		if n(N[z], nil, "|EQ|") then
			N[z] = j
		end
	end
	return N
end
local function P(N)
	local Q = {}
	for z, j in pairs(N) do
		Q[z] = j
	end
	return Q
end
local R = function() end
local S = function(T)
	T = T or 1
	local U = m["|Stringsub|"](str, B, s(B, s(T, 1, "|SUB|"), "|ADD|"))
	B = s(B, T, "|ADD|")
	return U
end
local V = function()
	local W, X = m["|Stringbyte|"](str, B, B + 1)
	B = B + 2
	return X * 256 + W
end
local Y = function()
	local W, X, Z = m["|Stringbyte|"](str, B, B + 2)
	B = B + 3
	return Z * 65536 + X * 256 + W
end
local _ = function()
	local W, X, Z, a0 = m["|Stringbyte|"](str, B, B + 3)
	B = B + 4
	return a0 * 16777216 + Z * 65536 + X * 256 + W
end
local a1 = function()
	local W, X, Z, a0, a2 = m["|Stringbyte|"](str, B, B + 4)
	B = B + 5
	return a0 * 16777216 + Z * 65536 + X * 256 + W + a2 * 4294967296
end
do
	return (function(a3, a4, a5, a6, a7, a8, a9, aa, ab, ac, ad, ae, af) end)()
end
