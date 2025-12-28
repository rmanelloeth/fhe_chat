<div align="center">

# 💬 Encrypted Chatooors
### Private chat • FHE encryption • On-chain by default

🔐 **Fully Homomorphic Encryption**  
⛓️ **Ethereum Sepolia** · 🧠 **Zama FHEVM**

[Live App](https://fhe-chat.vercel.app) · [Smart Contract](https://sepolia.etherscan.io/address/0xd50627e4b0E63dfBBBed2bC7d0B69cc497a99C18)

</div>

---

## ✨ Overview

**Encrypted Chatooors** is a decentralized chat application where **message privacy is enforced cryptographically**, not by trusting a server.

All messages are:
- encrypted **client-side**
- stored **on-chain**
- never visible in plaintext to contracts, servers, or operators

---

## 🔐 Why It’s Different

Traditional “private” messengers still:
- store plaintext on servers  
- rely on trust and policies  
- can be compromised or censored  

**Encrypted Chatooors** replaces trust with **Fully Homomorphic Encryption (FHE)**.

> If data is never decrypted, it cannot be leaked.

---

## 🚀 Key Features

### Privacy
- Client-side FHE encryption
- No plaintext on-chain
- Only encrypted `euint32` values stored with ACL support
- Decryption possible only via FHE relayer with user decryption (ACL enabled)

### Chat
- Create and join rooms
- Send encrypted messages
- Edit messages (re-encrypted)
- Emoji support
- Multiple rooms per user

### Identity
- Wallet-based identity
- On-chain nickname registry

---

## 🧠 How It Works

User types message
↓
Client-side FHE encryption (externalEuint32 + inputProof)
↓
Contract converts to euint32 and sets ACL via FHE.allow()
↓
Stored permanently on-chain as euint32

- Smart contracts never see plaintext  
- Blockchain stores only encrypted references  
- UI decrypts only for authorized users  

---

## 🧱 Smart Contract Model

```solidity
struct Message {
    address sender;
    euint32 encryptedContent; // Encrypted message with ACL support
    uint256 timestamp;
    bool edited;
}

// Key functions:
// sendMessage(roomId, externalEuint32 encryptedContent, bytes inputProof)
// editMessage(roomId, messageId, externalEuint32 newEncryptedContent, bytes inputProof)
// FHE.allow(content, msg.sender) // Sets ACL for user decryption

✔ Immutable history
✔ Encrypted by default
✔ Zero plaintext storage

⸻

🛠 Tech Stack

Privacy & Crypto
	•	Zama FHEVM
	•	FHE Relayer SDK

Blockchain
	•	Ethereum Sepolia
	•	Solidity ^0.8.24

Frontend
	•	Next.js 14
	•	TypeScript
	•	Tailwind CSS
	•	Wagmi + RainbowKit
	•	Ethers v6

⸻

⚙️ Local Development

npm install
npm run dev

.env.local

NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS=0xd50627e4b0E63dfBBBed2bC7d0B69cc497a99C18
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.drpc.org


⸻

⚠️ Notes
	•	Experimental cryptography
	•	Runs on Sepolia testnet
	•	Gas costs apply
	•	Message text stored in localStorage only for UI display
	•	On-chain data remains encrypted forever

⸻

👤 Author

DJ Rmanello
	•	X: https://x.com/rmanellooo
	•	Discord: DJ Rmanello

⸻

📄 License

MIT

⸻


<div align="center">


Private by design · Encrypted by default · On-chain forever

</div>
```
