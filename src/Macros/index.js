function visitChunk(chunk, opmap, settings = {}) {
    // Visit opcodes
    for (let Idx = 0; Idx < chunk.Instr.length; Idx++) {
        let inst = chunk.Instr[Idx]
        //console.log(inst)
        if (inst.Name === 'GETGLOBAL' && chunk.Instr[Idx + 1].Name === 'CALL') {
            Idx++
            let A = inst['1']


            //console.log(chunk.Const[inst['2']])
            let macro = chunk.Const[inst['2']]
            switch (macro) {
                case 'HF_TEST':

                    chunk.Tree.Chunk.UsedInstructions[macro] = true
                    if (chunk.Tree.OpQueue == undefined) 
                        chunk.Tree.OpQueue = []
    
                    chunk.Tree.OpQueue.push(macro)
                    inst.Enum = macro
                    inst.Name = macro
                    inst.Type = 'ABx'
                    inst.IsMacro = true
                    inst['1'] = A
                    inst['2'] = 0
                    inst['3'] = null
                    
                    // Remove the call?
                    chunk.Instr.splice(Idx, 1, null)

                    break
                case 'HF_GETSTACK':

                    chunk.Tree.Chunk.UsedInstructions[macro] = true
                    if (chunk.Tree.OpQueue == undefined) 
                        chunk.Tree.OpQueue = []
    
                    chunk.Tree.OpQueue.push(macro)
                    inst.Enum = macro
                    inst.Name = macro
                    inst.Type = 'ABx'
                    inst.IsMacro = true
                    inst['1'] = A
                    inst['2'] = 0
                    inst['3'] = null
                    
                    // Remove the call?
                    chunk.Instr.splice(Idx, 1, null)

                    break
                case 'HF_CRASH':

                    chunk.Tree.Chunk.UsedInstructions[macro] = true
                    if (chunk.Tree.OpQueue == undefined) 
                        chunk.Tree.OpQueue = []
    
                    chunk.Tree.OpQueue.push(macro)
                    inst.Enum = macro
                    inst.Name = macro
                    inst.IsMacro = true
                    inst.Type = 'ABx'
                    inst['1'] = A
                    inst['2'] = 0
                    inst['3'] = null
                    
                    // Remove the call?
                    chunk.Instr.splice(Idx, 1, null)

                    break
                default: break;
            }
        }
    }

    for (let Idx = 0; Idx < chunk.Proto.length; Idx++) {
        visitChunk(chunk.Proto[Idx], opmap, settings)
    }
}

module.exports = {
    Visit: (tree, settings) => {
        visitChunk(tree.Chunk, settings)
    }
}
