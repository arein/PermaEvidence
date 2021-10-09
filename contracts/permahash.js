export function handle(state, action) {
    if (action.input.function === 'index') {
        
        if (typeof action.input.hash !== 'string' || action.input.hash.length < 3) {
          throw new ContractError(`Invalid hash provided: ${action.input.hash}`)
        }

        const newHash = action.input.hash;
        const hashExists = state.hashes.filter((existingHash) => {
            return existingHash.hash === newHash;
        }).length > 0;

        if (hashExists) {
            throw new ContractError(`Hash exists already: ${newHash}`)
        }

        state.hashes.push({
          author: action.caller,
          hash: newHash,
          createdAt: SmartWeave.block.timestamp
        });
    
        return { state }
    }

    throw new ContractError('Invalid input')
  }