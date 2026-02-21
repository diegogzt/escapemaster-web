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

      {/* M estilizada, shifted left slightly to remove gap but avoid overlap */}
      <path 
        d="M 425 127 L 425 76 C 425 54, 459 54, 459 76 L 459 127 M 459 76 C 459 54, 493 54, 493 76 L 493 127" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="16" 
        strokeLinecap="round"
      />
      
      <text 
        x="505" 
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
