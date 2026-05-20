import React from 'react';
import { Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WalletButton({ address, onConnect, onDisconnect }) {
  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={address ? onDisconnect : onConnect}
      className="relative group px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300"></div>
      
      {/* Content */}
      <div className="relative flex items-center gap-2 text-white">
        {address ? (
          <>
            <Wallet size={16} />
            <span>{truncateAddress(address)}</span>
          </>
        ) : (
          <>
            <Wallet size={16} />
            <span>Connect Wallet</span>
          </>
        )}
      </div>
    </motion.button>
  );
}
