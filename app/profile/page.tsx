'use client'

import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { getChatContract, getChatContractReadOnly } from '@/lib/contract'
import { getBrowserProvider, getReadOnlyProvider } from '@/lib/provider'
import Link from 'next/link'

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [nickname, setNickname] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (isConnected && address) {
      loadProfile()
    } else {
      setIsLoading(false)
    }
  }, [isConnected, address])

  const loadProfile = async () => {
    if (!address) return
    
    setIsLoading(true)
    try {
      const provider = getReadOnlyProvider()
      const contract = getChatContractReadOnly(provider)
      
      // Add timeout for contract calls
      const registered = await Promise.race([
        contract.isUserRegistered(address),
        new Promise<boolean>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 15000)
        )
      ]) as boolean
      
      setIsRegistered(registered)
      
      if (registered) {
        const userNickname = await Promise.race([
          contract.getUserNickname(address),
          new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 15000)
          )
        ]) as string
        setNickname(userNickname)
      }
    } catch (error: any) {
      console.error('Error loading profile:', error)
      setError(error.message || 'Failed to load profile')
      // Don't block UI - allow user to try again
      setIsRegistered(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateNickname = async (e: React.FormEvent) => {
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

    setIsUpdating(true)
    setError('')
    setSuccess('')

    try {
      const provider = await getBrowserProvider(address)
      const signer = await provider.getSigner()
      const contract = getChatContract(signer)
      
      if (isRegistered) {
        const tx = await contract.updateNickname(nickname.trim())
        await tx.wait()
        setSuccess('Nickname updated successfully!')
      } else {
        const tx = await contract.registerUser(nickname.trim())
        await tx.wait()
        setIsRegistered(true)
        setSuccess('Nickname set successfully!')
      }
    } catch (err: any) {
      console.error('Error updating nickname:', err)
      setError(err.message || 'Failed to update nickname')
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center p-8 bg-gray-900 rounded-lg shadow-xl max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-white">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your profile.
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text">Profile</h1>
            <p className="text-gray-400">Manage your account settings</p>
          </div>

          {/* Profile Card */}
          <div className="bg-gray-900 rounded-lg p-8 space-y-6">
            {/* Wallet Address */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Wallet Address
              </label>
              <div className="p-3 bg-gray-800 rounded-lg text-white font-mono text-sm">
                {address}
              </div>
            </div>

            {/* Registration Status */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Registration Status
              </label>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className={`font-semibold ${isRegistered ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isRegistered ? '✓ Registered' : 'Not Registered'}
                </span>
              </div>
            </div>

            {/* Nickname Form */}
            <form onSubmit={handleUpdateNickname} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Nickname {isRegistered ? '(Update)' : '(Set)'}
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value)
                    setError('')
                    setSuccess('')
                  }}
                  placeholder="Enter your nickname"
                  maxLength={32}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isUpdating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 32 characters
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-900/50 border border-green-700 rounded-lg text-green-300 text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdating || !nickname.trim()}
                className="w-full px-6 py-3 rounded-lg gradient-bg text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Processing...' : isRegistered ? 'Update Nickname' : 'Set Nickname'}
              </button>
            </form>
          </div>

          {/* Quick Actions */}
          <div className="text-center">
            <Link
              href="/chat"
              className="inline-block px-6 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white font-semibold hover:bg-gray-700 transition"
            >
              Go to Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

