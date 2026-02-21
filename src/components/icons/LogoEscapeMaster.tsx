import React from "react";

export function LogoEscapeMaster({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 850 160" 
      className={className} 
      {...props}
    >
      {/* E estilizada */}
      <path 
        d="M 28 60 L 28 127 M 28 60 L 72 60 M 28 93 L 65 93 M 28 127 L 72 127" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="16" 
        strokeLinecap="round"
      />
      <text 
        x="84" 
        y="135" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontSize="115" 
        fontWeight="600" 
        fill="currentColor" 
        letterSpacing="-2"
      >
        scape
      </text>

      {/* M estilizada, shifted left by 110px to remove gap */}
      <path 
        d="M 360 127 L 360 76 C 360 54, 394 54, 394 76 L 394 127 M 394 76 C 394 54, 428 54, 428 76 L 428 127" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="16" 
        strokeLinecap="round"
      />
      
      <text 
        x="440" 
        y="135" 
        fontFamily="Arial, Helvetica, sans-serif" 
        fontSize="115" 
        fontWeight="600" 
        fill="currentColor" 
        letterSpacing="-2"
      >
        aster
      </text>
    </svg>
  );
}
