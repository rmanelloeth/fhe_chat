'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-black/50 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">encrypted chatooors</h3>
            <p className="text-gray-400 text-sm">
              Decentralized messaging with encrypted messages and rooms.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-400 hover:text-white transition">
                  Chat
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white transition">
                  Profile
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://docs.zama.ai/fhevm" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://github.com/rmanelloeth/fhe_chat" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://sepolia.etherscan.io/address/0xb3Bb917C435D3c14DD84b85993Cd6561def9F782" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  Smart Contract
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://x.com/rmanellooo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition"
                >
                  X: @rmanellooo
                </a>
              </li>
              <li className="text-gray-400">Discord: DJ Rmanello</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 encrypted chatooors. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Network: Sepolia</span>
            <span>|</span>
            <span>Powered by FHEVM</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

