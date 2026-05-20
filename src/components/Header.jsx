import React from 'react';
import { motion } from 'framer-motion';
import WalletButton from './WalletButton';

export default function Header({
  address,
  onConnect,
  onDisconnect,
  activePage,
  onPageChange,
}) {
  const pages = [
    { id: 'home', label: 'Home' },
    { id: 'vote', label: 'Vote' },
    { id: 'results', label: 'Results' },
    { id: 'admin', label: 'Admin' },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => onPageChange('home')}
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center font-bold text-xl">
            🗳️
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              TrueVote
            </h1>
            <p className="text-xs text-white/50">Secure Blockchain Voting</p>
          </div>
        </motion.div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {pages.map((page) => (
            <motion.button
              key={page.id}
              onClick={() => onPageChange(page.id)}
              className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activePage === page.id
                  ? 'text-white'
                  : 'text-white/60 hover:text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {activePage === page.id && (
                <motion.div
                  layoutId="underline"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {page.label}
            </motion.button>
          ))}
        </nav>

        {/* Wallet Button */}
        <WalletButton address={address} onConnect={onConnect} onDisconnect={onDisconnect} />
      </div>
    </motion.header>
  );
}
