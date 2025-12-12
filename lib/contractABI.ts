// Complete ABI for ChatRoom Contract
// Address: 0xb3Bb917C435D3c14DD84b85993Cd6561def9F782
// Network: Sepolia Testnet (Chain ID: 11155111)

export const CHAT_ROOM_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "roomId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "messageId", type: "uint256" },
      { indexed: true, internalType: "address", name: "sender", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "MessageEdited",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "roomId", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "messageId", type: "uint256" },
      { indexed: true, internalType: "address", name: "sender", type: "address" },
      { indexed: false, internalType: "uint256", name: "timestamp", type: "uint256" }
    ],
    name: "MessageSent",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "newNickname", type: "string" }
    ],
    name: "NicknameUpdated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "roomId", type: "uint256" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "address", name: "creator", type: "address" }
    ],
    name: "RoomCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "nickname", type: "string" }
    ],
    name: "UserRegistered",
    type: "event"
  },
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "description", type: "string" }
    ],
    name: "createRoom",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "roomId", type: "uint256" },
      { internalType: "uint256", name: "messageId", type: "uint256" },
      { internalType: "bytes", name: "newEncryptedContent", type: "bytes" }
    ],
    name: "editMessage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "roomId", type: "uint256" },
      { internalType: "uint256", name: "messageId", type: "uint256" }
    ],
    name: "getEncryptedMessage",
    outputs: [{ internalType: "bytes", name: "", type: "bytes" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "roomId", type: "uint256" },
      { internalType: "uint256", name: "messageId", type: "uint256" }
    ],
    name: "getMessageMetadata",
    outputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "uint256", name: "timestamp", type: "uint256" },
      { internalType: "bool", name: "edited", type: "bool" },
      { internalType: "uint256", name: "editTimestamp", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "roomId", type: "uint256" }],
    name: "getRoom",
    outputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "uint256", name: "createdAt", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "uint256", name: "roomId", type: "uint256" }],
    name: "getRoomMessageCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "getUserNickname",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "isUserRegistered",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "nickname", type: "string" }],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "roomId", type: "uint256" },
      { internalType: "bytes", name: "encryptedContent", type: "bytes" }
    ],
    name: "sendMessage",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "totalMessages",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalRooms",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "string", name: "newNickname", type: "string" }],
    name: "updateNickname",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const

export const CHAT_CONTRACT_ADDRESS = "0xb3Bb917C435D3c14DD84b85993Cd6561def9F782" as const

