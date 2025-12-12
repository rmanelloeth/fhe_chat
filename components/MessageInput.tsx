'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount } from 'wagmi'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { getChatContract } from '@/lib/contract'
import { getBrowserProvider } from '@/lib/provider'

interface MessageInputProps {
  roomId: number
}

export default function MessageInput({ roomId }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const { address } = useAccount()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const encryptMessage = (text: string): string => {
    // just convert text to hex for now
    const bytes = new TextEncoder().encode(text)
    return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const handleSend = async () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    try {
      const provider = await getBrowserProvider(address)
      const signer = await provider.getSigner()
      const contract = getChatContract(signer)
      
      const encrypted = encryptMessage(message.trim())
      const tx = await contract.sendMessage(roomId, encrypted)
      await tx.wait()
      
      setMessage('')
      setShowEmojiPicker(false)
    } catch (error: any) {
      console.error('Error sending message:', error)
      alert(error.message || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  return (
    <div className="border-t border-gray-700 p-4 bg-gray-800">
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-10">
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-2xl hover:bg-gray-700 p-2 rounded transition"
          title="Add emoji"
        >
          😊
        </button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message... (Press Enter to send, Shift+Enter for new line)"
          className="flex-1 bg-gray-700 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
          rows={1}
          disabled={isSending}
        />
        
        <button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          className="gradient-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition font-semibold shadow-lg"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

