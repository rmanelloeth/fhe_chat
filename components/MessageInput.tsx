'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount } from 'wagmi'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import { getChatContract } from '@/lib/contract'
import { getBrowserProvider } from '@/lib/provider'
import { initFHERelayer, encryptMessage, storeOriginalMessage } from '@/lib/fheEncryption'

interface MessageInputProps {
  roomId: number
}

export default function MessageInput({ roomId }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isRelayerReady, setIsRelayerReady] = useState(false)
  const { address } = useAccount()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  useEffect(() => {
    if (address) {
      // Set timeout to allow user to proceed even if relayer fails
      const initTimeout = setTimeout(() => {
        if (!isRelayerReady) {
          console.warn('FHE relayer initialization taking too long, allowing fallback')
          setIsRelayerReady(false)
        }
      }, 30000) // 30 second timeout
      
      initFHERelayer()
        .then(() => {
          clearTimeout(initTimeout)
          setIsRelayerReady(true)
        })
        .catch((error) => {
          clearTimeout(initTimeout)
          console.error('Failed to initialize FHE relayer:', error)
          setIsRelayerReady(false)
          // Show user-friendly message
          alert('FHE encryption is not available. Some features may be limited.')
        })
        
      return () => clearTimeout(initTimeout)
    }
  }, [address])

  const handleSend = async () => {
    if (!message.trim() || isSending || !address) return

    // Try to initialize if not ready, but don't block
    if (!isRelayerReady) {
      try {
        await initFHERelayer()
        setIsRelayerReady(true)
      } catch (error) {
        console.error('Failed to initialize FHE relayer:', error)
        alert('FHE encryption is not available. Please refresh the page.')
        return
      }
    }

    setIsSending(true)
    try {
      const messageText = message.trim()
      
      // Encrypt message using FHE
      const encryptedHandle = await encryptMessage(messageText, address)

      const provider = await getBrowserProvider(address)
      const signer = await provider.getSigner()
      const contract = getChatContract(signer)
      
      // Get current message count before sending
      const currentCount = await contract.getRoomMessageCount(roomId)
      const messageId = Number(currentCount)
      
      const tx = await contract.sendMessage(roomId, encryptedHandle)
      await tx.wait()
      
      // Store original message for decryption using the new messageId
      storeOriginalMessage(encryptedHandle, messageText, roomId, messageId)
      
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
        {!isRelayerReady && address && (
          <div className="text-xs text-yellow-400 mt-1">
            FHE encryption initializing... (this may take a moment)
          </div>
        )}
      </div>
    </div>
  )
}

