import { ethers } from 'ethers'
import { CHAT_ROOM_ABI } from './contractABI'

// contract address on sepolia
export const CHAT_CONTRACT_ADDRESS = '0xd50627e4b0E63dfBBBed2bC7d0B69cc497a99C18'

// Validate address helper (only when actually needed, not on import)
const validateAddress = (address: string): void => {
  try {
    if (!address || !ethers.isAddress(address)) {
      throw new Error('Invalid contract address')
    }
  } catch (error) {
    console.error('Invalid contract address:', address)
    throw new Error('Invalid contract address configuration')
  }
}

export const getChatContract = (signer: ethers.Signer) => {
  validateAddress(CHAT_CONTRACT_ADDRESS)
  return new ethers.Contract(CHAT_CONTRACT_ADDRESS, CHAT_ROOM_ABI, signer)
}

export const getChatContractReadOnly = (provider: ethers.Provider) => {
  validateAddress(CHAT_CONTRACT_ADDRESS)
  return new ethers.Contract(CHAT_CONTRACT_ADDRESS, CHAT_ROOM_ABI, provider)
}

