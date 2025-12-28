/**
 * FHE Encryption utilities using Zama FHEVM Relayer SDK
 */

import { getSigner } from './provider'

let relayerInstance: any = null
let isInitializing = false
let initPromise: Promise<any> | null = null

const CONTRACT_ADDRESS = '0xd50627e4b0E63dfBBBed2bC7d0B69cc497a99C18'

/**
 * Initialize FHE Relayer SDK
 */
export const initFHERelayer = async (): Promise<any> => {
  const startTime = Date.now()
  console.log('[FHE Relayer] Starting initialization...')
  
  if (relayerInstance) {
    console.log('[FHE Relayer] ✅ Already initialized, returning existing instance')
    return relayerInstance
  }

  if (isInitializing && initPromise) {
    console.log('[FHE Relayer] ⏳ Already initializing, waiting for existing promise...')
    return initPromise
  }

  isInitializing = true
  initPromise = (async () => {
    try {
      console.log('[FHE Relayer] Step 1/4: Checking environment...')
      if (typeof window === 'undefined') {
        throw new Error('Relayer can only be initialized in browser environment')
      }
      console.log('[FHE Relayer] ✅ Environment check passed')

      // Set up global polyfill for FHE relayer SDK compatibility
      // Note: Should be set in layout.tsx, but double-check here
      if (typeof (window as any).global === 'undefined') {
        console.log('[FHE Relayer] Setting up global polyfill (fallback)...')
        ;(window as any).global = globalThis
        console.log('[FHE Relayer] ✅ Global polyfill set (fallback)')
      } else {
        console.log('[FHE Relayer] Global polyfill already exists')
      }

      console.log('[FHE Relayer] Step 2/4: Loading relayer module (@zama-fhe/relayer-sdk/web)...')
      const moduleStartTime = Date.now()
      const relayerModule: any = await Promise.race([
        import('@zama-fhe/relayer-sdk/web'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Relayer load timeout')), 30000))
      ])
      const moduleLoadTime = Date.now() - moduleStartTime
      console.log(`[FHE Relayer] ✅ Module loaded in ${moduleLoadTime}ms`)

      console.log('[FHE Relayer] Step 3/4: Initializing SDK...')
      const sdkStartTime = Date.now()
      const sdkInitialized = await Promise.race([
        relayerModule.initSDK(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('SDK init timeout')), 30000))
      ])
      const sdkInitTime = Date.now() - sdkStartTime
      console.log(`[FHE Relayer] ✅ SDK initialized in ${sdkInitTime}ms`)

      if (!sdkInitialized) {
        throw new Error('SDK initialization failed')
      }

      console.log('[FHE Relayer] Step 4/4: Creating relayer instance with SepoliaConfig...')
      const instanceStartTime = Date.now()
      const instance = await Promise.race([
        relayerModule.createInstance(relayerModule.SepoliaConfig),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Instance creation timeout')), 30000))
      ])
      const instanceTime = Date.now() - instanceStartTime
      console.log(`[FHE Relayer] ✅ Instance created in ${instanceTime}ms`)

      relayerInstance = instance
      isInitializing = false
      const totalTime = Date.now() - startTime
      console.log(`[FHE Relayer] ✅✅✅ Initialization complete! Total time: ${totalTime}ms`)
      console.log('[FHE Relayer] Relayer is ready to use')
      return instance
    } catch (error: any) {
      isInitializing = false
      initPromise = null
      const totalTime = Date.now() - startTime
      console.error(`[FHE Relayer] ❌❌❌ Initialization failed after ${totalTime}ms:`, error)
      console.error('[FHE Relayer] Error details:', {
        message: error?.message,
        stack: error?.stack,
        name: error?.name
      })
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
 * Returns encrypted input with handle and inputProof for contract
 */
export const encryptMessage = async (
  text: string, 
  userAddress: string
): Promise<{ encryptedInput: any; handle: string }> => {
  const encryptStartTime = Date.now()
  console.log('[FHE Encryption] Starting encryption process...')
  
  if (!relayerInstance) {
    console.log('[FHE Encryption] Relayer not initialized, initializing now...')
    await initFHERelayer()
  }

  if (!relayerInstance) {
    console.error('[FHE Encryption] ❌ FHE relayer not initialized')
    throw new Error('FHE relayer not initialized')
  }
  
  console.log('[FHE Encryption] ✅ Relayer instance ready')

  // Convert string to number
  // Note: For strings longer than 4 bytes, this is a lossy conversion
  // We still need localStorage to store the original text for display
  console.log('[FHE Encryption] Converting message to number...')
  const value = stringToNumber(text)
  console.log('[FHE Encryption] Message value:', value)

  console.log('[FHE Encryption] Creating encrypted input builder...')
  console.log('[FHE Encryption] Contract address:', CONTRACT_ADDRESS)
  console.log('[FHE Encryption] User address:', userAddress)
  const inputBuilder = relayerInstance.createEncryptedInput(
    CONTRACT_ADDRESS,
    userAddress
  )
  console.log('[FHE Encryption] Adding value to input builder (add32)...')
  inputBuilder.add32(value)

  console.log('[FHE Encryption] Calling encrypt() - this may take a while...')
  const encryptCallStartTime = Date.now()
  const encryptedInput = await Promise.race([
    inputBuilder.encrypt(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Encryption timeout after 30 seconds')), 30000)
    )
  ]) as any
  const encryptCallTime = Date.now() - encryptCallStartTime
  console.log(`[FHE Encryption] ✅ encrypt() completed in ${encryptCallTime}ms`)

  if (!encryptedInput?.handles || encryptedInput.handles.length === 0) {
    console.error('[FHE Encryption] ❌ Encryption failed: no handles returned')
    throw new Error('Encryption failed')
  }
  
  console.log('[FHE Encryption] Received', encryptedInput.handles.length, 'handle(s)')

  // Convert handle to hex string if it's Uint8Array (for localStorage compatibility)
  const handle = encryptedInput.handles[0]
  let handleHex: string
  if (handle instanceof Uint8Array) {
    // Convert Uint8Array to hex string (bytes32)
    const hexString = Array.from(handle)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    handleHex = '0x' + hexString.padStart(64, '0')
  } else {
    handleHex = handle
  }
  
  const totalEncryptTime = Date.now() - encryptStartTime
  console.log(`[FHE Encryption] ✅✅✅ Encryption complete! Total time: ${totalEncryptTime}ms`)
  console.log('[FHE Encryption] Handle (first 20 chars):', handleHex.substring(0, 22) + '...')
  
  // Return encrypted input (contains externalEuint32 and inputProof) and handle (for localStorage)
  return {
    encryptedInput: encryptedInput, // Contains externalEuint32 format and inputProof
    handle: handleHex // For localStorage compatibility
  }
}

/**
 * Convert hex string to Uint8Array
 */
const hexToUint8Array = (hex: string): Uint8Array => {
  // Remove 0x prefix if present
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex
  
  // Ensure even length
  const paddedHex = cleanHex.length % 2 === 0 ? cleanHex : '0' + cleanHex
  
  // Convert to bytes
  const bytes = new Uint8Array(paddedHex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(paddedHex.substring(i * 2, i * 2 + 2), 16)
  }
  
  // Ensure exactly 32 bytes for bytes32
  if (bytes.length !== 32) {
    const padded = new Uint8Array(32)
    padded.set(bytes, 32 - bytes.length)
    return padded
  }
  
  return bytes
}

/**
 * Decrypt FHE handle back to number using relayer userDecrypt
 * @param fheHandle The encrypted handle (bytes32 hex string) from contract
 * @param userAddress The user address for decryption context
 * @returns Decrypted number value
 */
export const decryptMessageToNumber = async (fheHandle: string, userAddress: string): Promise<number | null> => {
  if (!relayerInstance) {
    console.log('[FHE Decryption] Initializing relayer...')
    await initFHERelayer()
  }

  if (!relayerInstance) {
    console.error('[FHE Decryption] FHE relayer not initialized')
    throw new Error('FHE relayer not initialized')
  }

  try {
    // Ensure handle is a hex string (starts with 0x)
    const handleHex = fheHandle.startsWith('0x') ? fheHandle : '0x' + fheHandle
    
    // Get signer for EIP712 signature
    const signer = await getSigner()
    
    // Step 1: Generate keypair
    const keypair = relayerInstance.generateKeypair()
    
    // Step 2: Prepare handle-contract pairs
    const handleContractPairs = [
      {
        handle: handleHex,
        contractAddress: CONTRACT_ADDRESS,
      },
    ]
    
    // Step 3: Create EIP712 structure
    const startTimeStamp = Math.floor(Date.now() / 1000).toString()
    const durationDays = '10' // 10 days validity
    const contractAddresses = [CONTRACT_ADDRESS]
    
    const eip712 = relayerInstance.createEIP712(
      keypair.publicKey,
      contractAddresses,
      startTimeStamp,
      durationDays,
    )
    
    // Step 4: Sign the typed data
    const signature = await signer.signTypedData(
      eip712.domain,
      {
        UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification,
      },
      eip712.message,
    )
    
    // Step 5: Call userDecrypt
    const decryptStartTime = Date.now()
    const result = await Promise.race([
      relayerInstance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''), // Remove 0x prefix
        contractAddresses,
        userAddress,
        startTimeStamp,
        durationDays,
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('User decryption timeout after 30 seconds')), 30000)
      )
    ]) as any

    const decryptTime = Date.now() - decryptStartTime

    // Extract decrypted value from result
    const decryptedValue = result[handleHex]

    if (decryptedValue === undefined || decryptedValue === null) {
      console.error('[FHE Decryption] ❌ No decrypted value found for handle')
      return null
    }

    // Convert BigInt to number if needed
    let value: number
    if (typeof decryptedValue === 'bigint') {
      value = Number(decryptedValue)
    } else if (typeof decryptedValue === 'number') {
      value = decryptedValue
    } else {
      console.error('[FHE Decryption] ❌ Unexpected decrypted value type:', typeof decryptedValue)
      return null
    }

    return value
  } catch (error: any) {
    console.error('[FHE Decryption] ❌ User decryption failed:', error)
    console.error('[FHE Decryption] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    return null
  }
}

/**
 * Decrypt FHE handle and convert back to string message
 * @param fheHandle The encrypted handle (bytes32 hex string) from contract
 * @param userAddress The user address for decryption context
 * @param forceDecrypt If true, skip localStorage cache and force decryption
 * @returns Decrypted message string or null if decryption fails
 */
export const decryptMessage = async (
  fheHandle: string, 
  userAddress: string,
  forceDecrypt: boolean = false
): Promise<string | null> => {
  try {
    // First try to get from localStorage (faster, works for messages we sent)
    if (!forceDecrypt) {
      const cached = getOriginalMessageByHandle(fheHandle)
      if (cached) {
        return cached
      }
    }

    // Validate handle
    if (!fheHandle || fheHandle === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      return null
    }

    // Decrypt using relayer
    const decryptedNumber = await decryptMessageToNumber(fheHandle, userAddress)
    
    if (decryptedNumber === null || decryptedNumber === undefined) {
      return null
    }

    // Convert number back to string
    const decryptedString = numberToString(decryptedNumber)

    // If decryption returned empty or invalid string, return null
    if (!decryptedString || decryptedString.length === 0 || decryptedString.trim().length === 0) {
      return null
    }

    // Cache the decrypted result
    if (typeof window !== 'undefined' && decryptedString) {
      try {
        const reverseKey = `fhe_chat_reverse_${fheHandle}`
        localStorage.setItem(reverseKey, JSON.stringify({
          message: decryptedString,
          decryptedAt: Date.now()
        }))
      } catch (e) {
        console.warn('[FHE Decryption] Failed to cache decrypted message:', e)
      }
    }

    return decryptedString
  } catch (error: any) {
    console.error('[FHE Decryption] ❌ Error decrypting message:', error)
    console.error('[FHE Decryption] Error details:', {
      message: error?.message,
      stack: error?.stack
    })
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

