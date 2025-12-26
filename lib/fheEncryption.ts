/**
 * FHE Encryption utilities using Zama FHEVM Relayer SDK
 */

let relayerInstance: any = null
let isInitializing = false
let initPromise: Promise<any> | null = null

const CONTRACT_ADDRESS = '0xa7e798a7D544673455E3196F5E3F853c51dE4C9C'

/**
 * Initialize FHE Relayer SDK
 */
export const initFHERelayer = async (): Promise<any> => {
  if (relayerInstance) {
    return relayerInstance
  }

  if (isInitializing && initPromise) {
    return initPromise
  }

  isInitializing = true
  initPromise = (async () => {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Relayer can only be initialized in browser environment')
      }

      // Set up global for FHE relayer SDK compatibility
      if (typeof (window as any).global === 'undefined') {
        (window as any).global = window
      }
      if (typeof (globalThis as any).global === 'undefined') {
        (globalThis as any).global = globalThis
      }

      console.log('Initializing FHE relayer...')
      
      const relayerModule: any = await Promise.race([
        import('@zama-fhe/relayer-sdk/web'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Relayer load timeout')), 15000))
      ])

      console.log('Relayer module loaded, initializing SDK...')

      const sdkInitialized = await Promise.race([
        relayerModule.initSDK(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SDK init timeout')), 15000))
      ])

      if (!sdkInitialized) {
        throw new Error('SDK initialization failed')
      }

      console.log('SDK initialized, creating instance...')

      const instance = await Promise.race([
        relayerModule.createInstance(relayerModule.SepoliaConfig),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Instance creation timeout')), 20000))
      ])

      console.log('FHE relayer initialized successfully')
      relayerInstance = instance
      isInitializing = false
      return instance
    } catch (error) {
      console.error('FHE relayer initialization failed:', error)
      isInitializing = false
      initPromise = null
      relayerInstance = null
      throw error
    }
  })()

  return initPromise
}

/**
 * Convert string to number for FHE encryption
 * Uses base-256 encoding to pack string into a number
 */
const stringToNumber = (text: string): number => {
  // Convert string to bytes
  const bytes = new TextEncoder().encode(text)
  
  // Pack first 4 bytes into a 32-bit number
  // For longer strings, we'll use a simple hash-based approach
  let value = 0
  const maxLength = 4
  
  if (bytes.length <= maxLength) {
    // Pack bytes directly
    for (let i = 0; i < bytes.length; i++) {
      value = (value << 8) | bytes[i]
    }
  } else {
    // For longer strings, create a deterministic number from the string
    // This is a one-way conversion but allows decryption via mapping
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    value = Math.abs(hash) % (2 ** 31 - 1)
  }
  
  // Ensure value fits in euint32 range (0 to 2^31 - 1)
  return value % (2 ** 31 - 1)
}

/**
 * Convert number back to string (for short strings only)
 */
const numberToString = (num: number): string => {
  // Try to unpack bytes
  const bytes: number[] = []
  let temp = num
  
  for (let i = 0; i < 4; i++) {
    bytes.unshift(temp & 0xFF)
    temp = temp >>> 8
  }
  
  // Remove leading zeros
  while (bytes.length > 0 && bytes[0] === 0) {
    bytes.shift()
  }
  
  if (bytes.length > 0) {
    try {
      return new TextDecoder().decode(new Uint8Array(bytes))
    } catch {
      return ''
    }
  }
  
  return ''
}

/**
 * Encrypt string message using FHE
 * Converts string to number and encrypts it
 */
export const encryptMessage = async (text: string, userAddress: string): Promise<string> => {
  if (!relayerInstance) {
    await initFHERelayer()
  }

  if (!relayerInstance) {
    throw new Error('FHE relayer not initialized')
  }

  // Convert string to number
  // Note: For strings longer than 4 bytes, this is a lossy conversion
  // We still need localStorage to store the original text for display
  const value = stringToNumber(text)

  const inputBuilder = relayerInstance.createEncryptedInput(
    CONTRACT_ADDRESS,
    userAddress
  )
  inputBuilder.add32(value)

  const encryptedInput = await Promise.race([
    inputBuilder.encrypt(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Encryption timeout')), 30000)
    )
  ]) as any

  if (!encryptedInput?.handles || encryptedInput.handles.length === 0) {
    throw new Error('Encryption failed')
  }

  // Return FHE handle as hex string (bytes32)
  return encryptedInput.handles[0]
}

/**
 * Decrypt FHE handle back to number (for short strings that fit in 4 bytes)
 * Note: This only works for very short strings (1-4 characters)
 * For longer strings, original text must be retrieved from localStorage
 */
export const decryptMessageToNumber = async (fheHandle: string, userAddress: string): Promise<number | null> => {
  if (!relayerInstance) {
    await initFHERelayer()
  }

  if (!relayerInstance) {
    throw new Error('FHE relayer not initialized')
  }

  try {
    // Note: Full decryption requires contract interaction and FHE relayer
    // For now, this is a placeholder - actual decryption would require:
    // 1. Call contract to get FHE handle
    // 2. Use relayer to decrypt the handle
    // 3. Convert number back to string
    
    // This is a complex operation that requires contract integration
    // For simplicity, we use localStorage for now
    
    return null
  } catch (error) {
    console.error('Decryption failed:', error)
    return null
  }
}

/**
 * Get FHE relayer instance
 */
export const getFHERelayerInstance = (): any => {
  if (!relayerInstance) {
    throw new Error('FHE relayer not initialized. Call initFHERelayer first.')
  }
  return relayerInstance
}

/**
 * Store original message for decryption
 * Maps FHE handle (bytes32) to original message text
 */
export const storeOriginalMessage = (fheHandle: string, originalMessage: string, roomId: number, messageId: number): void => {
  if (typeof window === 'undefined') return
  
  const storageKey = `fhe_chat_${roomId}_${messageId}`
  const storageData = {
    fheHandle,
    message: originalMessage,
    timestamp: Date.now()
  }
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(storageData))
    
    // Also store in reverse mapping for quick lookup
    const reverseKey = `fhe_chat_reverse_${fheHandle}`
    localStorage.setItem(reverseKey, JSON.stringify({
      roomId,
      messageId,
      message: originalMessage
    }))
  } catch (error) {
    console.error('Failed to store original message:', error)
  }
}

/**
 * Retrieve original message from storage
 */
export const getOriginalMessage = (roomId: number, messageId: number): string | null => {
  if (typeof window === 'undefined') return null
  
  const storageKey = `fhe_chat_${roomId}_${messageId}`
  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const data = JSON.parse(stored)
      return data.message || null
    }
  } catch (error) {
    console.error('Failed to retrieve original message:', error)
  }
  
  return null
}

/**
 * Retrieve original message by FHE handle
 */
export const getOriginalMessageByHandle = (fheHandle: string): string | null => {
  if (typeof window === 'undefined') return null
  
  const reverseKey = `fhe_chat_reverse_${fheHandle}`
  try {
    const stored = localStorage.getItem(reverseKey)
    if (stored) {
      const data = JSON.parse(stored)
      return data.message || null
    }
  } catch (error) {
    console.error('Failed to retrieve original message by handle:', error)
  }
  
  return null
}

