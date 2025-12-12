export const Logo = ({ className = "w-32 h-32" }: { className?: string }) => {
  return (
    <svg 
      width="200" 
      height="100" 
      viewBox="0 0 200 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Yellow oval outline */}
      <ellipse 
        cx="100" 
        cy="50" 
        rx="90" 
        ry="40" 
        stroke="#FFD700" 
        strokeWidth="3" 
        fill="none"
        style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
      />
      
      {/* Text "Chatooors" in handwritten style */}
      <text 
        x="100" 
        y="55" 
        textAnchor="middle" 
        fontSize="32" 
        fill="#FFD700" 
        fontFamily="'Comic Sans MS', 'Marker Felt', cursive, sans-serif"
        fontWeight="bold"
        style={{ 
          fontStyle: 'italic',
          letterSpacing: '2px'
        }}
      >
        Chatooors
      </text>
    </svg>
  )
}

export const LogoIcon = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 200 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Yellow oval outline */}
      <ellipse 
        cx="100" 
        cy="50" 
        rx="90" 
        ry="40" 
        stroke="#FFD700" 
        strokeWidth="3" 
        fill="none"
        style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
      />
      
      {/* Text "Chatooors" in handwritten style - smaller for icon */}
      <text 
        x="100" 
        y="55" 
        textAnchor="middle" 
        fontSize="20" 
        fill="#FFD700" 
        fontFamily="'Comic Sans MS', 'Marker Felt', cursive, sans-serif"
        fontWeight="bold"
        style={{ 
          fontStyle: 'italic',
          letterSpacing: '1px'
        }}
      >
        C
      </text>
    </svg>
  )
}



