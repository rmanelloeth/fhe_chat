import { BrowserProvider, JsonRpcProvider } from 'ethers'

// typescript window type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      isMetaMask?: boolean
      selectedAddress?: string
    }
  }
}

// get provider from browser wallet
export async function getBrowserProvider(address?: string): Promise<BrowserProvider> {
  if (!window.ethereum) {
    throw new Error('Please install a wallet extension (MetaMask, etc.)')
  }

  if (!address) {
    console.warn('getBrowserProvider called without address')
  }

  // make sure we're on sepolia
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    const sepoliaChainId = '0xaa36a7' // 11155111
    
    if (chainId !== sepoliaChainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: sepoliaChainId }],
        })
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (switchError: any) {
        if (switchError.code === 4001) {
          throw new Error('Please switch to Sepolia network in your wallet')
        }
        if (switchError.code === 4902) {
          // chain not added, add it
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: sepoliaChainId,
                chainName: 'Sepolia',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.drpc.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              }],
            })
            await new Promise(resolve => setTimeout(resolve, 1000))
          } catch (addError: any) {
            if (addError.code === 4001) {
              throw new Error('Please add Sepolia network in your wallet')
            }
            throw new Error('Please switch to Sepolia network')
          }
        } else {
          throw new Error('Please switch to Sepolia network')
        }
      }
    }
  } catch (error: any) {
    if (error.message && error.message.includes('network')) {
      throw error
    }
  }

  return new BrowserProvider(window.ethereum)
}

// get read-only provider (no wallet needed)
export function getReadOnlyProvider(): BrowserProvider | JsonRpcProvider {
  // try user's wallet first
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      return new BrowserProvider(window.ethereum)
    } catch (error) {
      console.warn('Failed to create provider from window.ethereum, using public RPC:', error)
    }
  }
  
  // fallback to public rpc
  const publicRpcUrl = 'https://sepolia.drpc.org'
  return new JsonRpcProvider(publicRpcUrl)
}

