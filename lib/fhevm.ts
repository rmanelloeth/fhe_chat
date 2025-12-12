import { BrowserProvider } from 'ethers'
import { initFhevm, createInstance } from 'fhevmjs'

let instance: any = null

export const initFhevmInstance = async (provider: BrowserProvider) => {
  if (instance) return instance

  await initFhevm()
  const network = await provider.getNetwork()
  const chainId = Number(network.chainId)
  
  // fhevm contract address
  const contractAddress = process.env.NEXT_PUBLIC_FHEVM_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
  
  instance = await createInstance({ chainId, publicKey: contractAddress })
  return instance
}

export const getFhevmInstance = () => {
  if (!instance) {
    throw new Error('FHEVM instance not initialized. Call initFhevmInstance first.')
  }
  return instance
}

export const encryptMessage = async (message: string, instance: any): Promise<string> => {
  // convert message to bytes
  const messageBytes = new TextEncoder().encode(message)
  
  // for now just convert to hex
  const encrypted = await instance.encrypt8(messageBytes[0] || 0)
  
  return '0x' + Array.from(messageBytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export const decryptMessage = async (encrypted: string, instance: any): Promise<string> => {
  // convert hex back to text
  const hex = encrypted.startsWith('0x') ? encrypted.slice(2) : encrypted
  const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])
  return new TextDecoder().decode(bytes)
}

