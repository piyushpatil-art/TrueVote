import React from 'react';

export default function BlockchainBackground({ className = '' }) {
  return (
    <div className={`blockchain-bg pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="blockchain-grid" />
      <div className="blockchain-glow blockchain-glow--purple" />
      <div className="blockchain-glow blockchain-glow--blue" />
      {[...Array(12)].map((_, i) => (
        <span
          key={i}
          className="blockchain-node"
          style={{
            left: `${8 + (i * 7) % 85}%`,
            top: `${12 + (i * 11) % 75}%`,
            animationDelay: `${i * 0.35}s`,
          }}
        />
      ))}
      {[...Array(6)].map((_, i) => (
        <span
          key={`l-${i}`}
          className="blockchain-link"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 22}%`,
            width: `${60 + i * 12}px`,
            transform: `rotate(${-20 + i * 15}deg)`,
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}
