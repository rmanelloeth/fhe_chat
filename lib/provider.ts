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
        // Try to switch first
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: sepoliaChainId }],
        })
        await new Promise(resolve => setTimeout(resolve, 1500))
      } catch (switchError: any) {
        if (switchError.code === 4001) {
          throw new Error('Please switch to Sepolia network in your wallet')
        }
        if (switchError.code === 4902) {
          // chain not added, add it with drpc RPC
          try {
            console.log('[Provider] Adding Sepolia network with drpc RPC...')
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
            await new Promise(resolve => setTimeout(resolve, 1500))
            console.log('[Provider] Sepolia network added successfully with drpc RPC')
          } catch (addError: any) {
            console.error('[Provider] Failed to add Sepolia network:', addError)
            if (addError.code === 4001) {
              throw new Error('Please add Sepolia network in your wallet. Make sure to use RPC: https://sepolia.drpc.org')
            }
            throw new Error('Please switch to Sepolia network. If you have issues, manually add Sepolia network with RPC: https://sepolia.drpc.org')
          }
        } else {
          console.error('[Provider] Failed to switch network:', switchError)
          throw new Error('Please switch to Sepolia network. If you have RPC errors, make sure Sepolia network uses: https://sepolia.drpc.org')
        }
      }
    } else {
      // Already on Sepolia, but warn if using wrong RPC
      console.log('[Provider] Already on Sepolia network. Make sure your wallet uses RPC: https://sepolia.drpc.org')
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
  const rpcUrl = 'https://sepolia.drpc.org'
  return new JsonRpcProvider(rpcUrl)
}

/**
 * Get signer directly from window.ethereum
 * Works with any wallet that wagmi supports
 */
export async function getSigner() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Wallet not found. Please connect your wallet.')
  }

  const provider = new BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  return signer
}

