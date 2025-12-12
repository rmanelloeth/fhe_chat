# encrypted chatooors 🔒

Chat app where your messages are actually private. Everything is encrypted and lives on the blockchain, so no one can read your stuff unless you want them to.

## What's this?

Remember when chat apps said they were "private" but you weren't really sure? This one actually is. Using FHEVM (fancy encryption stuff from Zama), your messages get encrypted before they even leave your browser. Then they sit on the blockchain, encrypted, forever. Or until you delete them. You know, blockchain things.

## What can you do?

- **Send private messages** - encrypted end-to-end, stored on-chain
- **Create rooms** - make your own chat rooms, invite whoever
- **Pick a nickname** - set it once, it's yours (on-chain, of course)
- **Edit messages** - oops, typo? fix it
- **Emojis** - because why not 😊

## Tech stack

Built with:
- Next.js 14 (React framework)
- TypeScript (because JavaScript wasn't enough)
- Tailwind CSS (makes things look nice)
- Wagmi v2 (Ethereum stuff)
- RainbowKit (wallet connection magic)
- Hardhat (smart contract dev)
- Solidity (the blockchain language)

## The contract

The smart contract lives here:
- **Address:** `0xb3Bb917C435D3c14DD84b85993Cd6561def9F782`
- **Network:** Sepolia Testnet (testnet, so don't use real money)

## Getting started

### Option A: Run locally

### 1. Install stuff

```bash
npm install
```

### 2. Set up environment

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_CHAT_CONTRACT_ADDRESS=0xb3Bb917C435D3c14DD84b85993Cd6561def9F782
NEXT_PUBLIC_FHEVM_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 3. Run it

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and connect your wallet.

### Option B: Run in Docker (isolated) 🐳

If you want extra security/isolation:

```bash
# Build and run in Docker
docker-compose up

# Or manually
docker build -t fhe-chat .
docker run -p 3000:3000 -v $(pwd):/app fhe-chat
```

This runs everything in an isolated container. See [SECURITY.md](./SECURITY.md) for more info.

### 4. Deploy your own contract (optional)

If you want to deploy your own version:

```bash
npm run deploy:sepolia
```

## How it works

1. Connect your wallet (MetaMask, etc.)
2. Set a nickname (stored on-chain)
3. Create or join a room
4. Start chatting - messages are encrypted before sending
5. Edit your messages if you need to

That's it. Simple.

## Notes

- This is on Sepolia testnet, so use test ETH
- Each transaction costs gas (obviously)
- Encryption is simplified for now - full FHEVM implementation coming later
- Don't use this for super secret stuff yet, it's still in development

---

Made by [DJ Rmanello](https://github.com/rmanelloeth)
