import React from 'react';
import { Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/cn';

export default function WalletButton({ address, onConnect, onDisconnect }) {
  const truncate = (addr) => (addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '');

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={address ? onDisconnect : onConnect}
      className={cn(
        'relative group flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden',
        'bg-gradient-to-r from-violet-600/90 to-blue-600/90 border border-white/15 wallet-glow',
        'hover:from-violet-500 hover:to-blue-500 transition-all duration-300',
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
            address ? 'bg-emerald-400' : 'bg-amber-400',
          )}
        />
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            address ? 'bg-emerald-400' : 'bg-amber-400',
          )}
        />
      </span>
      <Wallet size={16} className="opacity-90" />
      <span>{address ? truncate(address) : 'Connect'}</span>
    </motion.button>
  );
}
