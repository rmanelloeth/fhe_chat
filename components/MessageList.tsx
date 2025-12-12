'use client'

import { useState, useEffect, useRef } from 'react'
import { useAccount } from 'wagmi'
import { getChatContractReadOnly } from '@/lib/contract'
import { getReadOnlyProvider } from '@/lib/provider'
import { formatDistanceToNow } from 'date-fns'
import MessageItem from './MessageItem'

interface Message {
  id: number
  roomId: number
  sender: string
  timestamp: bigint
  edited: boolean
  editTimestamp: bigint
  encryptedContent: string
  decryptedContent?: string
}

interface MessageListProps {
  roomId: number
}

export default function MessageList({ roomId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [nicknames, setNicknames] = useState<Record<string, string>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { address } = useAccount()

  useEffect(() => {
    loadMessages()
    
    // check for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      const provider = getReadOnlyProvider()
      const contract = getChatContractReadOnly(provider)
      const messageCount = await contract.getRoomMessageCount(roomId)
      
      const messagePromises = []
      for (let i = 0; i < Number(messageCount); i++) {
        messagePromises.push(
          Promise.all([
            contract.getMessageMetadata(roomId, i),
            contract.getEncryptedMessage(roomId, i),
          ]).then(([metadata, encrypted]) => ({
            id: i,
            sender: metadata[0],
            timestamp: metadata[1],
            edited: metadata[2],
            editTimestamp: metadata[3],
            encryptedContent: encrypted,
          }))
        )
      }
      
      const loadedMessages = await Promise.all(messagePromises)
      
      // Load nicknames
      const uniqueSenders = [...new Set(loadedMessages.map(m => m.sender))]
      const nicknamePromises = uniqueSenders.map(async (sender) => {
        try {
          const nickname = await contract.getUserNickname(sender)
          return [sender, nickname]
        } catch {
          return [sender, sender.slice(0, 6) + '...' + sender.slice(-4)]
        }
      })
      
      const nicknameResults = await Promise.all(nicknamePromises)
      const nicknameMap: Record<string, string> = {}
      nicknameResults.forEach(([sender, nickname]) => {
        nicknameMap[sender] = nickname as string
      })
      setNicknames(nicknameMap)
      
      // decode hex back to text
      const decryptedMessages = loadedMessages.map(msg => ({
        id: msg.id,
        roomId: roomId,
        sender: msg.sender,
        timestamp: msg.timestamp,
        edited: msg.edited,
        editTimestamp: msg.editTimestamp,
        encryptedContent: msg.encryptedContent,
        decryptedContent: decryptMessage(msg.encryptedContent),
      }))
      
      setMessages(decryptedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const decryptMessage = (encrypted: string): string => {
    // convert hex back to text
    try {
      const hex = encrypted.startsWith('0x') ? encrypted.slice(2) : encrypted
      const bytes = new Uint8Array(hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [])
      return new TextDecoder().decode(bytes)
    } catch {
      return '[Encrypted]'
    }
  }

  const handleMessageEdited = () => {
    loadMessages()
  }

  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <p>No messages yet. Be the first to send a message! 👋</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            nickname={nicknames[message.sender] || message.sender.slice(0, 6) + '...' + message.sender.slice(-4)}
            isOwnMessage={message.sender.toLowerCase() === address?.toLowerCase()}
            onEdit={handleMessageEdited}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}

