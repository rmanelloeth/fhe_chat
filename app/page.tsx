'use client'

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="text-center">
          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            encrypted
          </h1>
          <h1 className="text-5xl md:text-7xl font-bold mb-8">
            <span className="bg-gradient-to-r from-teal-400 to-purple-500 bg-clip-text text-transparent">
              chatooors
            </span>
          </h1>
          
          {/* Made by */}
          <p className="text-3xl md:text-5xl font-bold text-gray-300">
            made by DJ Rmanello
          </p>
        </div>
      </div>
    </div>
  )
}
