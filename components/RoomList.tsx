'use client'

import { useState, useEffect } from 'react'
import { getChatContractReadOnly } from '@/lib/contract'
import { getReadOnlyProvider } from '@/lib/provider'
import { formatDistanceToNow } from 'date-fns'

interface Room {
  id: number
  name: string
  description: string
  creator: string
  createdAt: bigint
}

interface RoomListProps {
  selectedRoom: number | null
  onSelectRoom: (roomId: number) => void
}

export default function RoomList({ selectedRoom, onSelectRoom }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRooms()
    
    // refresh room list every 5 seconds
    const interval = setInterval(loadRooms, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadRooms = async () => {
    try {
      const provider = getReadOnlyProvider()
      const contract = getChatContractReadOnly(provider)
      const totalRooms = await contract.totalRooms()
      
      const roomPromises = []
      for (let i = 0; i < Number(totalRooms); i++) {
        roomPromises.push(
          contract.getRoom(i).then((room: any) => ({
            id: i,
            name: room[0],
            description: room[1],
            creator: room[2],
            createdAt: room[3],
          }))
        )
      }
      
      const loadedRooms = await Promise.all(roomPromises)
      setRooms(loadedRooms)
    } catch (error) {
      console.error('Error loading rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-gray-400 text-sm">No rooms yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {rooms.map((room) => (
        <button
          key={room.id}
          onClick={() => onSelectRoom(room.id)}
          className={`w-full text-left p-4 border-b border-gray-700 hover:bg-gray-700 transition ${
            selectedRoom === room.id ? 'bg-gray-700 border-l-4 border-l-purple-500' : ''
          }`}
        >
          <div className="font-semibold text-white mb-1">{room.name}</div>
          <div className="text-sm text-gray-400 mb-2 line-clamp-2">{room.description}</div>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(Number(room.createdAt) * 1000), { addSuffix: true })}
          </div>
        </button>
      ))}
    </div>
  )
}

