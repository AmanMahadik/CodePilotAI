import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  className?: string;
  rounded?: string;
}

export default function Logo({ size = 28, className = '', rounded = 'rounded-lg' }: LogoProps) {
  return (
    <div 
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 ${rounded} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="CodePilot AI Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
