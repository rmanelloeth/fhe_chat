'use client'

import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text">About FHE Chat</h1>
            <p className="text-xl text-gray-400">
              Understanding the technology behind private messaging
            </p>
          </div>

          {/* What is FHE Chat */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-white">What is FHE Chat?</h2>
            <p className="text-gray-300 leading-relaxed">
              FHE Chat is a decentralized messaging application that leverages Fully Homomorphic Encryption (FHE) 
              to ensure complete privacy of your messages. Unlike traditional encryption, FHE allows computations 
              to be performed on encrypted data without ever decrypting it, providing an unprecedented level of privacy.
            </p>
          </section>

          {/* FHE Technology */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Fully Homomorphic Encryption (FHE)</h2>
            <div className="space-y-3 text-gray-300 leading-relaxed">
              <p>
                Fully Homomorphic Encryption is a form of encryption that allows computations to be performed 
                directly on encrypted data without needing to decrypt it first. This means:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your messages remain encrypted even during processing</li>
                <li>No third party can read your messages, even the service provider</li>
                <li>Computations can be performed on encrypted data securely</li>
                <li>Complete privacy is maintained throughout the entire process</li>
              </ul>
            </div>
          </section>

          {/* ZAMA Technology */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Powered by ZAMA</h2>
            <p className="text-gray-300 leading-relaxed">
              FHE Chat is built using <strong className="text-white">ZAMA's FHEVM</strong> (Fully Homomorphic Encryption Virtual Machine), 
              which brings FHE capabilities to the Ethereum blockchain. This allows us to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
              <li>Store encrypted messages on-chain</li>
              <li>Perform computations on encrypted data</li>
              <li>Maintain complete privacy while leveraging blockchain benefits</li>
              <li>Ensure messages are immutable and verifiable</li>
            </ul>
          </section>

          {/* Contract Functions */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Smart Contract Functions</h2>
            <div className="bg-gray-900 rounded-lg p-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">User Management</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li><code className="text-purple-400">registerUser(string nickname)</code> - Register with a nickname</li>
                  <li><code className="text-purple-400">updateNickname(string newNickname)</code> - Update your nickname</li>
                  <li><code className="text-purple-400">getUserNickname(address user)</code> - Get user's nickname</li>
                  <li><code className="text-purple-400">isUserRegistered(address user)</code> - Check registration status</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Room Management</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li><code className="text-purple-400">createRoom(string name, string description)</code> - Create a chat room</li>
                  <li><code className="text-purple-400">getRoom(uint256 roomId)</code> - Get room information</li>
                  <li><code className="text-purple-400">totalRooms</code> - Get total number of rooms</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Message Management</h3>
                <ul className="space-y-1 text-gray-300 text-sm">
                  <li><code className="text-purple-400">sendMessage(uint256 roomId, bytes encryptedContent)</code> - Send encrypted message</li>
                  <li><code className="text-purple-400">editMessage(uint256 roomId, uint256 messageId, bytes newEncryptedContent)</code> - Edit message</li>
                  <li><code className="text-purple-400">getRoomMessageCount(uint256 roomId)</code> - Get message count</li>
                  <li><code className="text-purple-400">getMessageMetadata(...)</code> - Get message metadata</li>
                  <li><code className="text-purple-400">getEncryptedMessage(...)</code> - Get encrypted content</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contract Info */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Contract Information</h2>
            <div className="bg-gray-900 rounded-lg p-6 space-y-3">
              <div>
                <span className="text-gray-400">Address:</span>
                <code className="ml-2 text-purple-400">0xa7e798a7D544673455E3196F5E3F853c51dE4C9C</code>
              </div>
              <div>
                <span className="text-gray-400">Network:</span>
                <span className="ml-2 text-white">Sepolia Testnet</span>
              </div>
              <div>
                <span className="text-gray-400">Chain ID:</span>
                <span className="ml-2 text-white">11155111</span>
              </div>
              <div>
                <a
                  href="https://sepolia.etherscan.io/address/0xa7e798a7D544673455E3196F5E3F853c51dE4C9C"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  View on Etherscan →
                </a>
              </div>
            </div>
          </section>

          {/* Resources */}
          <section className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Resources</h2>
            <div className="space-y-2 text-gray-300">
              <p>
                <a href="https://docs.zama.org/protocol" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                  Zama Protocol Documentation
                </a>
              </p>
              <p>
                <a href="https://github.com/zama-ai/fhevm" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                  FHEVM GitHub Repository
                </a>
              </p>
              <p>
                <a href="https://docs.zama.ai/protocol/zama-protocol-litepaper" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
                  Zama Protocol Litepaper
                </a>
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center pt-8">
            <Link
              href="/chat"
              className="inline-block px-8 py-4 rounded-lg gradient-bg text-white font-semibold hover:opacity-90 transition shadow-lg"
            >
              Start Chatting
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

