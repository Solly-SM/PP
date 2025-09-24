import React from 'react';
import './PulseLogo.css';

const PulseLogo = ({ animated = false, size = 24, className = '', ...props }) => {
  return (
    <svg
      className={`pulse-logo ${animated ? 'animated' : ''} ${className}`}
      width={size}
      height={Math.round(size * 0.6)} // 60/100 aspect ratio
      viewBox="0 0 100 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Zig-zag line pattern */}
      <path
        className="zig-zag-line"
        d="M5 30 L15 15 L25 45 L35 15 L45 45 L55 15 L65 45 L75 15 L85 45 L95 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Heart shape at the end */}
      <path
        d="M88 25 C88 22, 90 20, 93 20 C96 20, 98 22, 98 25 C98 28, 93 33, 93 33 C93 33, 88 28, 88 25 Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default PulseLogo;