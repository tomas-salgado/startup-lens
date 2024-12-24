import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  color?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  width = 40, 
  height = 40, 
  color = '#000000' 
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="6" />
      
      {/* Inner details */}
      <circle cx="50" cy="50" r="5" fill={color} />
      
      {/* Compass points */}
      <path
        d="M50 15L55 45L50 50L45 45L50 15Z"
        fill={color}
        transform="rotate(0, 50, 50)"
      />
      <path
        d="M50 15L55 45L50 50L45 45L50 15Z"
        fill={color}
        transform="rotate(90, 50, 50)"
      />
      <path
        d="M50 15L55 45L50 50L45 45L50 15Z"
        fill={color}
        transform="rotate(180, 50, 50)"
      />
      <path
        d="M50 15L55 45L50 50L45 45L50 15Z"
        fill={color}
        transform="rotate(270, 50, 50)"
      />
    </svg>
  );
};

export default Logo; 