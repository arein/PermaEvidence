export function handle(state, action) {
    if (action.input.function === 'index') {
        if (typeof action.input.hash !== 'string' || action.input.hash.length < 3) {
          throw new ContractError(`Invalid hash provided: ${action.input.hash}`)
        }
        state.hashes.append = {
          author: action.caller,
          hash: action.input.hash
        }
    
        return { state }
    }

    throw new ContractError('Invalid input')
  }