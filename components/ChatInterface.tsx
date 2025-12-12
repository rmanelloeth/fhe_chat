'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import RoomList from './RoomList'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import CreateRoomModal from './CreateRoomModal'

export default function ChatInterface() {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [showCreateRoom, setShowCreateRoom] = useState(false)
  const { address } = useAccount()

  return (
    <div className="flex h-[calc(100vh-200px)] bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
      {/* Sidebar with rooms */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-white">Rooms</h2>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="gradient-bg hover:opacity-90 text-white px-3 py-1 rounded text-sm transition shadow-lg"
              title="Create new room"
            >
              + New
            </button>
          </div>
        </div>
        
        <RoomList
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom !== null ? (
          <>
            <MessageList roomId={selectedRoom} />
            <MessageInput roomId={selectedRoom} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-900">
            <div className="text-center">
              <p className="text-xl mb-2">👈 Select a room to start chatting</p>
              <p className="text-sm">Or create a new room to get started!</p>
            </div>
          </div>
        )}
      </div>

      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onRoomCreated={(roomId) => {
            setSelectedRoom(roomId)
            setShowCreateRoom(false)
          }}
        />
      )}
    </div>
  )
}

