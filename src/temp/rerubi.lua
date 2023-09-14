

local Select	= select;
local Byte		= string.byte;
local Sub		= string.sub;

local Opmode = {
	{b = 'OpArgR', c='OpArgN'}, {b = 'OpArgK', c='OpArgN'}, {b = 'OpArgU', c='OpArgU'},
	{b = 'OpArgR', c='OpArgN'}, {b = 'OpArgU', c='OpArgN'}, {b = 'OpArgK', c='OpArgN'},
	{b = 'OpArgR', c='OpArgK'}, {b = 'OpArgK', c='OpArgN'}, {b = 'OpArgU', c='OpArgN'},
	{b = 'OpArgK', c='OpArgK'}, {b = 'OpArgU', c='OpArgU'}, {b = 'OpArgR', c='OpArgK'},
	{b = 'OpArgK', c='OpArgK'}, {b = 'OpArgK', c='OpArgK'}, {b = 'OpArgK', c='OpArgK'},
	{b = 'OpArgK', c='OpArgK'}, {b = 'OpArgK', c='OpArgK'}, {b = 'OpArgK', c='OpArgK'},
	{b = 'OpArgR', c='OpArgN'}, {b = 'OpArgR', c='OpArgN'}, {b = 'OpArgR', c='OpArgN'},
	{b = 'OpArgR', c='OpArgR'}, {b = 'OpArgR', c='OpArgN'}, {b = 'OpArgK', c='OpArgK'},
	{b = 'OpArgK', c='OpArgK'}, {b = 'OpArgK', c='OpArgK'}, {b = 'OpArgR', c='OpArgU'},
	{b = 'OpArgR', c='OpArgU'}, {b = 'OpArgU', c='OpArgU'}, {b = 'OpArgU', c='OpArgU'},
	{b = 'OpArgU', c='OpArgN'}, {b = 'OpArgR', c='OpArgN'}, {b = 'OpArgR', c='OpArgN'},
	{b = 'OpArgN', c='OpArgU'}, {b = 'OpArgU', c='OpArgU'}, {b = 'OpArgN', c='OpArgN'},
	{b = 'OpArgU', c='OpArgN'}, {b = 'OpArgU', c='OpArgN'}
};

local Opcode	= { -- Opcode types.
	'ABC',	'ABx',	'ABC',	'ABC';
	'ABC',	'ABx',	'ABC',	'ABx';
	'ABC',	'ABC',	'ABC',	'ABC';
	'ABC',	'ABC',	'ABC',	'ABC';
	'ABC',	'ABC',	'ABC',	'ABC';
	'ABC',	'ABC',	'AsBx',	'ABC';
	'ABC',	'ABC',	'ABC',	'ABC';
	'ABC',	'ABC',	'ABC',	'AsBx';
	'AsBx',	'ABC',	'ABC',	'ABC';
	'ABx',	'ABC';
};

-- rlbi author -> Rerumu
-- special thanks;
--	@cntkillme for providing faster bit extraction
--	@Eternal for being #1 bug finder and providing better float decoder
--	@stravant for contributing to the original project this is derived from

-- rerubi is an upgrade to the original Lua VM in Lua
-- the prime goal of rerubi is to be the fastest:tm: alternative
-- to a Lua in Lua bytecode execution

local function gBit(Bit, Start, End) -- No tail-calls, yay.
	if End then -- Thanks to cntkillme for giving input on this shorter, better approach.
		local Res	= (Bit / 2 ^ (Start - 1)) % 2 ^ ((End - 1) - (Start - 1) + 1);

		return Res - Res % 1;
	else
		local Plc = 2 ^ (Start - 1);

		if (Bit % (Plc + Plc) >= Plc) then
			return 1;
		else
			return 0;
		end;
	end;
end;

local function GetMeaning(ByteString)
	local Pos	= 1;
	local gSizet;
	local gInt;

	local function gBits8() -- Get the next byte in the stream.
		local F	= Byte(ByteString, Pos, Pos);

		Pos	= Pos + 1;

		return F;
	end;

	local function gBits32()
		local W, X, Y, Z	= Byte(ByteString, Pos, Pos + 3);

		Pos	= Pos + 4;

		return (Z * 16777216) + (Y * 65536) + (X * 256) + W;
	end;

    local function gByte8()
		return gBits32() + gBits32()
	end;

	local function gBits64()
		return gBits32() * 4294967296 + gBits32();
	end;

	local function gFloat()
		-- thanks @Eternal for giving me this so I could mangle it in here and have it work
		local Left = gBits32();
		local Right = gBits32();
		local IsNormal = 1
		local Mantissa = (gBit(Right, 1, 20) * (2 ^ 32))
						+ Left;

		local Exponent = gBit(Right, 21, 31);
		local Sign = ((-1) ^ gBit(Right, 32));

		if (Exponent == 0) then
			if (Mantissa == 0) then
				return Sign * 0 -- +-0
			else
				Exponent = 1
				IsNormal = 0
			end
		elseif (Exponent == 2047) then
			if (Mantissa == 0) then
				return Sign * (1 / 0) -- +-Inf
			else
				return Sign * (0 / 0) -- +-Q/Nan
			end
		end

		-- sign * 2**e-1023 * isNormal.mantissa
		return math.ldexp(Sign, Exponent - 1023) * (IsNormal + (Mantissa / (2 ^ 52)))
	end;

	local function gString(Len)
		local Str;

		if Len then
			Str	= Sub(ByteString, Pos, Pos + Len - 1);

			Pos = Pos + Len;
		else
			Len = gSizet();

			if (Len == 0) then return; end;

			Str	= Sub(ByteString, Pos, Pos + Len - 1);

			Pos = Pos + Len;
		end;

		return Str;
	end;

	local function ChunkDecode()
		local Instr	= {};
		local Const	= {};
		local Proto	= {};
		local Chunk	= {
			Instr	= Instr; -- Instructions
			Const	= Const; -- Constants
			Proto	= Proto; -- Prototypes
			Lines	= {}; -- Lines
			Name	= gString(); -- Grab name string.
		};

        for i = 1, #ByteString do
        --    print(i, ByteString:sub(i, i))
        end

        print("NAME:", Chunk.Name)

        Chunk.FirstL	= gInt(); -- First line.
        Chunk.LastL	= gInt(); -- Last line.
        Chunk.Upvals	= gBits8(); -- Upvalue count.
        Chunk.Args	= gBits8(); -- Arg count.
        Chunk.Vargs	= gBits8(); -- Vararg type.
        Chunk.Stack	= gBits8(); -- Stack.
		local ConstantReferences = {}; -- for an optimization

		if Chunk.Name then
			Chunk.Name	= Sub(Chunk.Name, 1, -2);
		end;
		

		for Idx = 1, gInt() do -- Loading instructions to the chunk.
			local Data	= gBits32();
			local Opco	= gBit(Data, 1, 6);

            print(Data, Opco)
			local Type	= Opcode[Opco + 1];
			local Mode  = Opmode[Opco + 1];

			local Inst	= {
				Enum	= Opco;
				Value	= Data;
				gBit(Data, 7, 14); -- Register A.
			};

			if (Type == 'ABC') then -- Most common, basic instruction type.
				Inst[2]	= gBit(Data, 24, 32);
				Inst[3]	= gBit(Data, 15, 23);
			elseif (Type == 'ABx') then
				Inst[2]	= gBit(Data, 15, 32);
			elseif (Type == 'AsBx') then
				Inst[2]	= gBit(Data, 15, 32) - 131071;
			end;

			-- Precompute data for some instructions
			do 
				-- TEST and TESTSET 
				if Opco == 26 or Opco == 27 then 
					Inst[3] = Inst[3] == 0;
				end

				-- EQ, LT, LE
				if Opco >= 23 and Opco <= 25 then 
					Inst[1] = Inst[1] ~= 0;
				end 

				-- Anything that looks at a constant using B
				if Mode.b == 'OpArgK' then
					Inst[3] = Inst[3] or false; -- Simply to guarantee that Inst[4] is inserted in the array part
					if Inst[2] >= 256 then 
						local Cons = Inst[2] - 256;
						Inst[4] = Cons;

						local ReferenceData = ConstantReferences[Cons];
						if not ReferenceData then 
							ReferenceData = {};
							ConstantReferences[Cons] = ReferenceData;
						end

						ReferenceData[#ReferenceData + 1] = {Inst = Inst, Register = 4}
					end
				end 

				-- Anything that looks at a constant using C
				if Mode.c == 'OpArgK' then
					Inst[4] = Inst[4] or false -- Simply to guarantee that Inst[5] is inserted in the array part
					if Inst[3] >= 256 then 
						local Cons = Inst[3] - 256;
						Inst[5] = Cons;

						local ReferenceData = ConstantReferences[Cons];
						if not ReferenceData then 
							ReferenceData = {};
							ConstantReferences[Cons] = ReferenceData;
						end

						ReferenceData[#ReferenceData + 1] = {Inst = Inst, Register = 5}
					end
				end 
			end

			Instr[Idx]	= Inst;
		end;

		for Idx = 1, gInt() do -- Load constants.
			local Type	= gBits8();
			local Cons;

			if (Type == 1) then -- Boolean
				Cons	= (gBits8() ~= 0);
			elseif (Type == 3) then -- Float/Double
				Cons	= gFloat();
			elseif (Type == 4) then
				Cons	= Sub(gString(), 1, -2);
			end;

			-- Finish precomputing constants
			local Refs = ConstantReferences[Idx - 1];
			if Refs then 
				for i = 1, #Refs do
					Refs[i].Inst[Refs[i].Register] = Cons
				end 
			end

			-- Write Constant to pool
			Const[Idx - 1]	= Cons;
		end;

		for Idx = 1, gInt() do -- Nested function prototypes.
			Proto[Idx - 1]	= ChunkDecode();
		end;

		do -- Debugging
			local Lines	= Chunk.Lines;

			for Idx = 1, gInt() do
				Lines[Idx]	= gBits32();
			end;

			for _ = 1, gInt() do -- Locals in stack.
				gString(); -- Name of local.
				gBits32(); -- Starting point.
				gBits32(); -- End point.
			end;

			for _ = 1, gInt() do -- Upvalues.
				gString(); -- Name of upvalue.
			end;
		end;

		return Chunk; -- Finished chunk.
	end;

	do -- Most of this chunk I was too lazy to reformat or change
		assert(gString(4) == "\27Lua", "Lua bytecode expected.");
		assert(gBits8() == 0x51, "Only Lua 5.1 is supported.");

		gBits8(); -- Probably version control.
		gBits8(); -- Is small endians.

		local IntSize	= gBits8(); -- Int size
		local Sizet		= gBits8(); -- size_t

        print(IntSize, Sizet)
		if (IntSize == 4) then
			gInt	= gBits32;
		elseif (IntSize == 8) then
			gInt	= gByte8;
		else
			error('Integer size not supported', 2);
		end;

		if (Sizet == 4) then
			gSizet	= gBits32;
		elseif (Sizet == 8) then
			gSizet	= gByte8;
		else
			error('Sizet size not supported', 2);
		end;

        print("SHIT:", gBits8(), gBits8(), gBits8(), Pos)
        
		--assert(gString(3) == "\4\8\0", "Unsupported bytecode target platform");
	end;

	return ChunkDecode();
end;


local function loadBytecode(BCode, Env) -- lua_function LoadBytecode (string BCode, table Env)
	local Buffer	= GetMeaning(BCode);

	--return Wrap(Buffer, Env or getfenv(0)), Buffer;
end;

local hex_to_char = {}
for idx = 0, 255 do
    hex_to_char[("%02X"):format(idx)] = string.char(idx)
    hex_to_char[("%02x"):format(idx)] = string.char(idx)
end

-- should be
str = "1B4C75615100010404040800160000007072696E7428227468697320776F726B7331212229000000000000000000000002020400000005000000414000001C4000011E0080000200000004060000007072696E7400040D0000007468697320776F726B733121000000000004000000010000000100000001000000010000000000000000000000"

-- fail
str1 = "1B4C7561510001040804080016000000000000007072696E7428227468697320776F726B7331212229000000000000000000000002020400000005000000414000001C4000011E008000020000000406000000000000007072696E7400040D000000000000007468697320776F726B733121000000000004000000010000000100000001000000010000000000000000000000"

print("===== START1 =======")
print(pcall(function()
loadBytecode(str:gsub("(..)", hex_to_char))
end))
print("===== END1 =======")

print("===== START2 =======")
print(pcall(function()
loadBytecode(str1:gsub("(..)", hex_to_char))
end))
print("===== END2 =======")
