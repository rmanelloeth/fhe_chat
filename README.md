# encrypted chatooors

Private chat app using FHEVM. Messages are encrypted and stored on blockchain.

## Features

- Private encrypted messages
- Chat rooms
- Set your nickname
- Edit messages
- Emoji support

## Tech

- Next.js 14
- TypeScript
- Tailwind CSS
- Wagmi v2
- RainbowKit
- Hardhat
- Solidity

## Contract

**Address:** `0xb3Bb917C435D3c14DD84b85993Cd6561def9F782`  
**Network:** Sepolia Testnet

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local`:
```env
NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS=0xb3Bb917C435D3c14DD84b85993Cd6561def9F782
NEXT_PUBLIC_FHEVM_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

3. Run:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy Contract

```bash
npm run deploy:sepolia
```

---

Made by DJ Rmanello
