# 🥷💬 encrypted chatooors

> **Private chat app** • Messages encrypted with FHE • On-chain by default

**Contact**: dc: DJ Rmanello / x: @rmanellooo

---

## 💡 Concept

**encrypted chatooors** is a decentralized chat application where your messages are truly private. Unlike traditional chat apps that claim privacy but store your data on central servers, this app encrypts every message using Fully Homomorphic Encryption (FHE) before it even leaves your browser, then stores it encrypted on the blockchain.

**The Core Idea**: Create chat rooms, send messages, and communicate privately. All message content is encrypted using FHE before being stored on-chain as euint32 (encrypted uint32). Your conversations remain encrypted throughout the entire lifecycle — only authorized parties can decrypt messages using the FHE relayer with ACL (Access Control Lists).

**Why It Matters**: Traditional chat apps require trust in the platform. They can read your messages, they can be hacked, and they control your data. With FHE on blockchain, cryptographic guarantees replace trust. Messages remain encrypted until explicitly decrypted by authorized parties.

---

## 🎯 Quick Overview

| Aspect | Description |
|--------|-------------|
| **What** | Decentralized chat app with encrypted messages |
| **Privacy** | All messages encrypted with FHE (Fully Homomorphic Encryption) |
| **Network** | Ethereum Sepolia Testnet |
| **Encryption** | Zama FHEVM + FHE Relayer SDK |
| **Storage** | Messages stored on-chain as FHE handles |

---

## 🚀 Features

### 🔒 Privacy & Security

- **FHE Encryption**: All messages encrypted using Zama FHEVM
- **Client-Side Encryption**: Messages encrypted before blockchain submission
- **On-Chain Storage**: Encrypted messages stored permanently on blockchain
- **No Plaintext Storage**: Original message text never stored on-chain
- **Cryptographic Guarantees**: Privacy enforced by mathematics, not trust

### 💬 Chat Features

- **🏠 Create Rooms**: Create your own chat rooms with custom names
- **📝 Send Messages**: Send encrypted messages to rooms
- **✏️ Edit Messages**: Edit your messages (re-encrypted with FHE)
- **👤 Set Nickname**: Choose your on-chain nickname
- **😊 Emojis**: Add emojis to your messages
- **👥 Multiple Rooms**: Join multiple chat rooms

---

## 🎮 How to Use

1. **Connect Wallet** → Connect your Ethereum wallet (MetaMask, WalletConnect, etc.)
2. **Set Nickname** → Register with a nickname (stored on-chain)
3. **Create Room** → Create a new chat room or join existing ones
4. **Send Messages** → Type and send messages (automatically encrypted with FHE)
5. **Edit Messages** → Edit your own messages if needed
6. **Chat Privately** → All messages remain encrypted on-chain

---

## 🏗️ Technical Architecture

### FHE Encryption Flow

```
┌─────────────────┐
│  Message Text   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  FHE Relayer    │  ← Client-side encryption
│  SDK Encrypts   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  euint32        │  ← Encrypted uint32 with ACL
│  (encrypted)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Blockchain     │  ← Stored on-chain
│  Contract       │
└─────────────────┘
```

### Data Flow

1. **Message Creation**: User types a message
2. **FHE Encryption**: Message text is encrypted using FHE Relayer SDK (creates externalEuint32 + inputProof)
3. **Contract Storage**: Contract converts externalEuint32 to euint32 and sets ACL via FHE.allow()
4. **On-Chain Storage**: euint32 stored in Message struct on-chain
5. **Retrieval**: Messages can be retrieved as euint32
6. **Decryption**: euint32 can be decrypted client-side via FHE relayer (user decryption with ACL)

---

## 🔧 Technical Stack

### Blockchain & Privacy

| Component | Technology |
|-----------|-----------|
| **Network** | Ethereum Sepolia Testnet |
| **Privacy Layer** | Fully Homomorphic Encryption (FHE) via Zama FHEVM |
| **Encryption SDK** | Zama FHEVM Relayer SDK (v0.3.0-6) |
| **Storage** | On-chain storage as euint32 with ACL support |
| **RPC Provider** | sepolia.drpc.org for Sepolia network access |

### Frontend

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js 14 with React and TypeScript |
| **Styling** | Tailwind CSS |
| **Wallet** | Wagmi + RainbowKit |
| **Blockchain** | Ethers.js v6 |
| **FHE** | @zama-fhe/relayer-sdk for client-side encryption |

### Smart Contracts

| Component | Details |
|-----------|---------|
| **Language** | Solidity ^0.8.24 |
| **Contract** | ChatRoom.sol |
| **FHE Support** | All message content stored as euint32 with FHE.allow() ACL |

---

## 📋 Contract Details

**Contract Address**: `0xd50627e4b0E63dfBBBed2bC7d0B69cc497a99C18`  
**Network**: Sepolia Testnet  
**Deployer**: `0x017e4229b9C37BdEDfF92FB00a7Cb79EA1876a7a`

### Key Functions

#### User Management

- `registerUser(string nickname)`  
  Register a new user with a nickname

- `updateNickname(string newNickname)`  
  Update your nickname

- `getUserNickname(address user)`  
  Get user's nickname

- `isUserRegistered(address user)`  
  Check if user is registered

#### Room Management

- `createRoom(string name, string description)`  
  Create a new chat room

- `getRoom(uint256 roomId)`  
  Get room information

- `totalRooms()`  
  Get total number of rooms

#### Message Management

- `sendMessage(uint256 roomId, externalEuint32 encryptedContent, bytes inputProof)`  
  Send an encrypted message (externalEuint32 converted to euint32 with ACL)

- `editMessage(uint256 roomId, uint256 messageId, externalEuint32 newEncryptedContent, bytes inputProof)`  
  Edit a message with new FHE-encrypted content (euint32 with ACL)

- `getMessageMetadata(uint256 roomId, uint256 messageId)`  
  Get message metadata (sender, timestamp, edited status)

- `getEncryptedMessage(uint256 roomId, uint256 messageId)`  
  Get euint32 for encrypted message content (supports ACL decryption)

- `getRoomMessageCount(uint256 roomId)`  
  Get number of messages in a room

---

## 🔐 FHE Implementation

### How FHE Works Here

**Fully Homomorphic Encryption (FHE)** allows computations to be performed on encrypted data without decrypting it first. In this application:

1. **Message Text** (plaintext) is encrypted client-side using Zama FHEVM Relayer SDK
2. **Encryption Result** is externalEuint32 + inputProof — external encrypted format
3. **Contract Conversion** converts externalEuint32 to euint32 and sets ACL via FHE.allow()
4. **On-Chain Storage** stores euint32 instead of plaintext message
5. **Retrieval** returns euint32, which can be decrypted via FHE relayer (user decryption with ACL)

### Encryption Process

```typescript
// Client-side encryption example
const encryptMessage = async (text: string, userAddress: string) => {
  // Convert string to number
  const value = stringToNumber(text)

  // Create encrypted input via FHE relayer
  const inputBuilder = relayerInstance.createEncryptedInput(
    CONTRACT_ADDRESS,
    userAddress
  )
  inputBuilder.add32(value)

  // Encrypt and get externalEuint32 + inputProof
  const encryptedInput = await inputBuilder.encrypt()
  return {
    encryptedInput: encryptedInput,  // Contains externalEuint32 format + inputProof
    handle: encryptedInput.handles[0]  // For localStorage compatibility
  }
}
```

### Contract Storage

```solidity
struct Message {
    address sender;
    uint256 roomId;
    euint32 encryptedContent;  // Encrypted message content with ACL support
    uint256 timestamp;
    uint256 messageId;
    bool edited;
    uint256 editTimestamp;
}

// In sendMessage and editMessage:
euint32 content = FHE.fromExternal(encryptedContent, inputProof);
FHE.allow(content, msg.sender);  // Set ACL for user decryption
```

### Privacy Guarantees

✅ **No Plaintext Storage**: Original message text never stored on-chain  
✅ **Encrypted Storage**: Only euint32 (encrypted values) are stored  
✅ **ACL Support**: FHE.allow() sets access control for user decryption  
✅ **Client-Side Encryption**: Messages encrypted before blockchain submission  
✅ **Client-Side Decryption**: Messages decrypted via FHE relayer with user decryption  
✅ **Permanent Storage**: Messages stored permanently on blockchain in encrypted form

---

## 🛠️ Setup & Development

### Prerequisites

- Node.js 18+ and npm
- Ethereum wallet with Sepolia testnet ETH
- Git for version control

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   
   Create `.env.local`:
   ```env
   SEPOLIA_RPC_URL=https://sepolia.drpc.org
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.drpc.org
   NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS=0xd50627e4b0E63dfBBBed2bC7d0B69cc497a99C18
   NEXT_PUBLIC_FHEVM_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
   PRIVATE_KEY=your_private_key_for_deployment
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Compile contracts** (if needed)
   ```bash
   npm run compile
   ```

### Contract Deployment

1. **Deploy to Sepolia**
   ```bash
   node scripts/deploy-chat.js
   ```

2. **Update addresses**
   - Update `.env.local` with new contract address
   - Update Vercel environment variables

### Production Deployment

Deployed on Vercel (configure environment variables in dashboard for production builds).

---

## 📁 Project Structure

```
MAIN/
├── app/
│   ├── about/
│   │   └── page.tsx          # About page
│   ├── chat/
│   │   └── page.tsx          # Chat interface page
│   ├── profile/
│   │   └── page.tsx          # User profile page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── providers.tsx         # Wagmi/RainbowKit providers
│   └── globals.css           # Global styles
├── components/
│   ├── ChatInterface.tsx     # Main chat component
│   ├── CreateRoomModal.tsx   # Room creation modal
│   ├── MessageInput.tsx      # Message input with FHE encryption
│   ├── MessageList.tsx       # Message list display
│   ├── MessageItem.tsx       # Individual message component
│   ├── RoomList.tsx          # Room list sidebar
│   ├── NicknameModal.tsx     # Nickname setup modal
│   └── ...                   # Other components
├── contracts/
│   └── ChatRoom.sol          # Smart contract with FHE support
├── lib/
│   ├── fheEncryption.ts      # FHE encryption utilities
│   ├── contract.ts           # Contract interaction utilities
│   ├── contractABI.ts        # Contract ABI
│   └── provider.ts           # Blockchain provider utilities
├── scripts/
│   └── deploy-chat.js        # Contract deployment script
└── Configuration files
    ├── package.json
    ├── tsconfig.json
    ├── hardhat.config.ts
    └── ...
```

---

## ✅ Current Status

**Network**: Sepolia Testnet  
**Status**: ✅ Production-ready

### Implemented Features

- ✅ FHE encryption via Zama FHEVM Relayer SDK
- ✅ User registration with nicknames
- ✅ Room creation and management
- ✅ Encrypted message sending
- ✅ Message editing with re-encryption
- ✅ Emoji support
- ✅ Modern UI with Tailwind CSS
- ✅ Wallet connection via RainbowKit
- ✅ Smart contract with FHE handle support
- ✅ Production-ready deployment

### Considerations

- ⚠️ Running on Sepolia testnet (test tokens only)
- ⚠️ FHE operations require relayer connection
- ⚠️ Gas costs vary based on network conditions
- ⚠️ Experimental technology — use at your own risk
- ℹ️ Message content encrypted as euint32 on-chain (cannot decrypt without relayer and ACL)
- ℹ️ Message decryption requires FHE relayer integration with user decryption (ACL enabled)

---

## 📚 Additional Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh)
- [Ethereum Sepolia Testnet](https://sepolia.dev)

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

Built with:
- **[Zama FHEVM](https://www.zama.ai/)** — Fully Homomorphic Encryption
- **[Next.js](https://nextjs.org/)** — Web framework
- **[Wagmi](https://wagmi.sh/)** & **[RainbowKit](https://www.rainbowkit.com/)** — Wallet integration
- **[Ethereum](https://ethereum.org/)** — Blockchain infrastructure

---

*Private by design • Encrypted by default • Powered by FHE*
