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
      console.log('[MessageInput] Initializing FHE relayer...')
      const initStartTime = Date.now()
      initFHERelayer()
        .then(() => {
          const initTime = Date.now() - initStartTime
          console.log(`[MessageInput] ✅ FHE relayer initialized successfully in ${initTime}ms`)
          setIsRelayerReady(true)
        })
        .catch((error) => {
          const initTime = Date.now() - initStartTime
          console.error(`[MessageInput] ❌ Failed to initialize FHE relayer after ${initTime}ms:`, error)
          setIsRelayerReady(false)
        })
    }
  }, [address])

  const handleSend = async () => {
    if (!message.trim() || isSending || !address) return

    if (!isRelayerReady) {
      alert('FHE encryption system is not ready. Please wait...')
      return
    }

    setIsSending(true)
    try {
      const messageText = message.trim()
      
      // Encrypt message using FHE
      const { encryptedInput, handle } = await encryptMessage(messageText, address)

      const provider = await getBrowserProvider(address)
      const signer = await provider.getSigner()
      const contract = getChatContract(signer)
      
      // Get current message count before sending
      const currentCount = await contract.getRoomMessageCount(roomId)
      const messageId = Number(currentCount)
      
      // externalEuint32 is the first handle from encryptedInput
      // inputProof is encryptedInput.inputProof
      const externalEuint32 = encryptedInput.handles[0]
      const inputProof = encryptedInput.inputProof || '0x'
      
      const tx = await contract.sendMessage(roomId, externalEuint32, inputProof)
      await tx.wait()
      
      // Store original message for decryption using the new messageId
      storeOriginalMessage(handle, messageText, roomId, messageId)
      
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
          disabled={!message.trim() || isSending || !isRelayerReady}
          className="gradient-bg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition font-semibold shadow-lg"
        >
          {isSending ? 'Sending...' : !isRelayerReady ? 'Initializing FHE...' : 'Send'}
        </button>
        {!isRelayerReady && address && (
          <div className="text-xs text-yellow-400 mt-1">
            Initializing FHE encryption...
          </div>
        )}
      </div>
    </div>
  )
}

