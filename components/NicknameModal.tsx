'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { getChatContract, getChatContractReadOnly } from '@/lib/contract'
import { getBrowserProvider, getReadOnlyProvider } from '@/lib/provider'

interface NicknameModalProps {
  onClose: () => void
  onNicknameSet: () => void
}

export default function NicknameModal({ onClose, onNicknameSet }: NicknameModalProps) {
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [error, setError] = useState('')
  const { address, isConnected } = useAccount()
  
  // check if user already has a nickname
  useEffect(() => {
    if (isConnected && address) {
      checkRegistration()
    } else {
      setIsChecking(false)
    }
  }, [isConnected, address])

  const checkRegistration = async () => {
    if (!address) {
      setIsChecking(false)
      return
    }
    
    setIsChecking(true)
    setError('')
    try {
      const provider = getReadOnlyProvider()
      const contract = getChatContractReadOnly(provider)
      
      // check if registered, timeout after 10 seconds
      const registered = await Promise.race([
        contract.isUserRegistered(address),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]) as boolean
      
      console.log('Registration check result:', { address, registered })
      setIsRegistered(registered)
      
      if (registered) {
        // get the current nickname
        try {
          const currentNickname = await contract.getUserNickname(address)
          console.log('Loaded nickname:', currentNickname)
          setNickname(currentNickname)
        } catch (err: any) {
          console.error('Error loading nickname:', err)
        }
      }
    } catch (error: any) {
      console.error('Error checking registration:', error)
      
      // if it's a network issue, just let them try anyway
      if (error.message?.includes('Timeout') || error.message?.includes('network') || error.code === 'NETWORK_ERROR') {
        console.warn('Network issue, letting user proceed')
        setIsRegistered(false)
      } else {
        setError('Unable to check registration status. You can still try to set your nickname.')
      }
    } finally {
      setIsChecking(false)
    }
  }
  
  // wallet not connected
  if (!isConnected || !address) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] backdrop-blur-sm">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-red-500 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Wallet Not Connected</h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet first to set your nickname.
          </p>
        </div>
      </div>
    )
  }

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] backdrop-blur-sm">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-purple-500 shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Checking registration...</p>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      setError('Nickname cannot be empty')
      return
    }

    if (nickname.length > 32) {
      setError('Nickname must be 32 characters or less')
      return
    }

    if (!address) {
      setError('Wallet not connected')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Pass address from wagmi to skip redundant eth_accounts check
      const provider = await getBrowserProvider(address)
      const signer = await provider.getSigner()
      const contract = getChatContract(signer)
      
      let tx
      if (isRegistered) {
        // update existing nickname
        tx = await contract.updateNickname(nickname.trim())
      } else {
        // register new user
        tx = await contract.registerUser(nickname.trim())
      }
      
      await tx.wait()
      
      setIsRegistered(true)
      onNicknameSet()
    } catch (err: any) {
      console.error('Error setting nickname:', err)
      if (err.code === 4001 || err.message?.includes('user rejected') || err.message?.includes('User rejected')) {
        setError('Transaction rejected by user')
      } else if (err.message?.includes('User already registered')) {
        setError('You are already registered. Please refresh the page.')
        setTimeout(() => {
          setIsRegistered(true)
          checkRegistration()
        }, 2000)
      } else if (err.message?.includes('Please')) {
        setError(err.message)
      } else {
        setError(err.message || 'Failed to set nickname. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-purple-500 shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-4">
          {isRegistered ? 'Update Nickname' : 'Welcome! 👋'}
        </h2>
        <p className="text-gray-300 mb-6">
          {isRegistered 
            ? 'Update your nickname. This will be stored on-chain via a blockchain transaction.'
            : 'Choose your nickname to start chatting. This will be stored on-chain via a blockchain transaction.'
          }
        </p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value)
              setError('')
            }}
            placeholder="Enter your nickname"
            maxLength={32}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
            autoFocus
          />
          
          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}
          
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || !nickname.trim()}
              className="flex-1 gradient-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition shadow-lg text-lg"
            >
              {isLoading 
                ? 'Signing Transaction...' 
                : isRegistered 
                  ? 'Update Nickname & Sign Transaction'
                  : 'Set Nickname & Sign Transaction'
              }
            </button>
          </div>
          {isLoading && (
            <p className="text-yellow-400 text-sm mt-4 text-center">
              ⚠️ Please confirm the transaction in your wallet
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

