import { ethers } from 'ethers'
import { CHAT_ROOM_ABI } from './contractABI'

// contract address on sepolia - always use the deployed address
export const CHAT_CONTRACT_ADDRESS = '0xa7e798a7D544673455E3196F5E3F853c51dE4C9C'

export const getChatContract = (signer: ethers.Signer) => {
  // Use the deployed contract address directly
  const address = '0xa7e798a7D544673455E3196F5E3F853c51dE4C9C'
  return new ethers.Contract(address, CHAT_ROOM_ABI, signer)
}

export const getChatContractReadOnly = (provider: ethers.Provider) => {
  // Use the deployed contract address directly
  const address = '0xa7e798a7D544673455E3196F5E3F853c51dE4C9C'
  return new ethers.Contract(address, CHAT_ROOM_ABI, provider)
}

