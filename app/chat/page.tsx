'use client'

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import ChatInterface from '@/components/ChatInterface'
import NicknameModal from '@/components/NicknameModal'
import { getChatContractReadOnly } from '@/lib/contract'
import { getReadOnlyProvider } from '@/lib/provider'
import Link from 'next/link'

export default function ChatPage() {
  const { address, isConnected } = useAccount()
  const [isRegistered, setIsRegistered] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showNicknameModal, setShowNicknameModal] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      checkUserRegistration()
    } else {
      setIsChecking(false)
    }
  }, [isConnected, address])

  const checkUserRegistration = async () => {
    if (!address) {
      setIsChecking(false)
      return
    }
    
    setIsChecking(true)
    try {
      const provider = getReadOnlyProvider()
      const contract = getChatContractReadOnly(provider)
      
      // check registration with 10 second timeout
      const registered = await Promise.race([
        contract.isUserRegistered(address),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]) as boolean
      
      console.log('Chat page - Registration check:', { address, registered })
      setIsRegistered(registered)
      
      if (!registered) {
        setShowNicknameModal(true)
      } else {
        setShowNicknameModal(false)
      }
    } catch (error: any) {
      console.error('Error checking registration:', error)
      // if check fails, show the modal anyway
      setIsRegistered(false)
      setShowNicknameModal(true)
    } finally {
      setIsChecking(false)
    }
  }

  const handleNicknameSet = async () => {
    // refresh registration status
    if (address) {
      await checkUserRegistration()
    }
    setShowNicknameModal(false)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8 bg-gray-900 rounded-lg shadow-xl max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to access the chat interface.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-lg gradient-bg text-white font-semibold hover:opacity-90 transition"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking registration...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {!isRegistered && !isChecking && (
        <NicknameModal
          onClose={() => {}}
          onNicknameSet={handleNicknameSet}
        />
      )}
      
      {isRegistered && (
        <div className="container mx-auto p-4 h-[calc(100vh-200px)]">
          <ChatInterface />
        </div>
      )}
    </div>
  )
}

