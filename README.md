<div align="center">

# 💬 Encrypted Chatooors
### Private chat • FHE encryption • On-chain by default

🔐 **Fully Homomorphic Encryption**  
⛓️ **Ethereum Sepolia** · 🧠 **Zama FHEVM**

[Live App](https://fhe-chat.vercel.app) · [Smart Contract](https://sepolia.etherscan.io/address/0xa7e798a7D544673455E3196F5E3F853c51dE4C9C)

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
- Only encrypted `bytes32` handles stored
- Decryption possible only via FHE relayer

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
Client-side FHE encryption
↓
Encrypted handle (bytes32)
↓
Stored permanently on-chain

- Smart contracts never see plaintext  
- Blockchain stores only encrypted references  
- UI decrypts only for authorized users  

---

## 🧱 Smart Contract Model

```solidity
struct Message {
    address sender;
    bytes32 encryptedContent; // FHE handle
    uint256 timestamp;
    bool edited;
}

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
	•	Solidity ^0.8.20

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

NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS=0xa7e798a7D544673455E3196F5E3F853c51dE4C9C
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://0xrpc.io/sep


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
