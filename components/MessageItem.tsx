'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAccount } from 'wagmi'
import { getChatContract } from '@/lib/contract'
import { getBrowserProvider } from '@/lib/provider'
import { initFHERelayer, encryptMessage, storeOriginalMessage, decryptMessage } from '@/lib/fheEncryption'

interface MessageItemProps {
  message: {
    id: number
    roomId: number
    sender: string
    timestamp: bigint
    edited: boolean
    editTimestamp: bigint
    decryptedContent?: string
    isDecrypted?: boolean
    encryptedContent?: string
  }
  nickname: string
  isOwnMessage: boolean
  onEdit: () => void
  onDecrypt?: () => void
}

export default function MessageItem({ message, nickname, isOwnMessage, onEdit, onDecrypt }: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.decryptedContent || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [isRelayerReady, setIsRelayerReady] = useState(false)
  const { address } = useAccount()

  useEffect(() => {
    if (address) {
      console.log('[MessageItem] Initializing FHE relayer...')
      const initStartTime = Date.now()
      initFHERelayer()
        .then(() => {
          const initTime = Date.now() - initStartTime
          console.log(`[MessageItem] ✅ FHE relayer initialized successfully in ${initTime}ms`)
          setIsRelayerReady(true)
        })
        .catch((error) => {
          const initTime = Date.now() - initStartTime
          console.error(`[MessageItem] ❌ Failed to initialize FHE relayer after ${initTime}ms:`, error)
          setIsRelayerReady(false)
        })
    }
  }, [address])

  const handleEdit = async () => {
    if (!isOwnMessage || !address) return
    
    if (isEditing) {
      if (!isRelayerReady) {
        alert('FHE encryption system is not ready. Please wait...')
        return
      }

      // save the edit
      setIsSaving(true)
      try {
        const editText = editContent.trim()
        
        // Encrypt message using FHE
        const { encryptedInput, handle } = await encryptMessage(editText, address)

        const provider = await getBrowserProvider(address)
        const signer = await provider.getSigner()
        const contract = getChatContract(signer)
        
        // externalEuint32 is the first handle from encryptedInput
        // inputProof is encryptedInput.inputProof
        const externalEuint32 = encryptedInput.handles[0]
        const inputProof = encryptedInput.inputProof || '0x'
        
        const tx = await contract.editMessage(message.roomId, message.id, externalEuint32, inputProof)
        await tx.wait()
        
        // Store updated original message
        storeOriginalMessage(handle, editText, message.roomId, message.id)
        
        setIsEditing(false)
        onEdit()
      } catch (error: any) {
        console.error('Error editing message:', error)
        alert(error.message || 'Failed to edit message')
      } finally {
        setIsSaving(false)
      }
    } else {
      setIsEditing(true)
      setEditContent(message.decryptedContent || '')
    }
  }

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg p-3`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-semibold ${isOwnMessage ? 'text-blue-100' : 'text-gray-200'}`}>
            {nickname}
          </span>
          <span className={`text-xs ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'}`}>
            {formatDistanceToNow(new Date(Number(message.timestamp) * 1000), { addSuffix: true })}
          </span>
          {message.edited && (
            <span className={`text-xs italic ${isOwnMessage ? 'text-blue-200' : 'text-gray-400'}`}>
              (edited)
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-800 text-white p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="gradient-bg hover:opacity-90 text-white px-3 py-1 rounded text-sm transition shadow-lg"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2 group">
            <div className="flex-1">
              <p className={`text-sm ${isOwnMessage ? 'text-white' : 'text-gray-100'} whitespace-pre-wrap break-words`}>
                {message.decryptedContent || '[Encrypted]'}
              </p>
              {message.decryptedContent && message.decryptedContent.includes('[Encrypted') && 
               !message.isDecrypted && 
               isRelayerReady && 
               message.encryptedContent && (
                <button
                  onClick={async () => {
                    if (!address || !message.encryptedContent) return
                    setIsDecrypting(true)
                    try {
                      const decrypted = await decryptMessage(message.encryptedContent, address, true)
                      if (decrypted && onDecrypt) {
                        onDecrypt()
                      }
                    } catch (error) {
                      console.error('Manual decryption failed:', error)
                    } finally {
                      setIsDecrypting(false)
                    }
                  }}
                  disabled={isDecrypting}
                  className="text-xs text-blue-400 hover:text-blue-300 mt-1 underline"
                >
                  {isDecrypting ? 'Decrypting...' : 'Decrypt message'}
                </button>
              )}
            </div>
            {isOwnMessage && (
              <button
                onClick={handleEdit}
                className="text-xs text-gray-300 hover:text-purple-400 opacity-0 group-hover:opacity-100 transition ml-2"
                title="Edit message"
                disabled={isSaving}
              >
                ✏️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

