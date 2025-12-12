'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { getChatContract } from '@/lib/contract'
import { getBrowserProvider } from '@/lib/provider'

interface CreateRoomModalProps {
  onClose: () => void
  onRoomCreated: (roomId: number) => void
}

export default function CreateRoomModal({ onClose, onRoomCreated }: CreateRoomModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')
  const { address } = useAccount()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Room name cannot be empty')
      return
    }

    if (name.length > 64) {
      setError('Room name must be 64 characters or less')
      return
    }

    if (!address) {
      setError('Wallet not connected')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      const provider = await getBrowserProvider(address)
      const signer = await provider.getSigner()
      const contract = getChatContract(signer)
      
      const tx = await contract.createRoom(name.trim(), description.trim())
      const receipt = await tx.wait()
      
      // find the room ID from the event
      const roomCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log)
          return parsed?.name === 'RoomCreated'
        } catch {
          return false
        }
      })
      
      if (roomCreatedEvent) {
        const parsed = contract.interface.parseLog(roomCreatedEvent)
        const roomId = parsed?.args[0]
        onRoomCreated(Number(roomId))
      } else {
        // if event not found, just use total rooms - 1
        const totalRooms = await contract.totalRooms()
        onRoomCreated(Number(totalRooms) - 1)
      }
    } catch (err: any) {
      console.error('Error creating room:', err)
      setError(err.message || 'Failed to create room')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Create New Room</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Room Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              placeholder="e.g., General, Tech Talk, Random"
              maxLength={64}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this room about?"
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              disabled={isCreating}
            />
          </div>
          
          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isCreating}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex-1 gradient-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition shadow-lg"
            >
              {isCreating ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

