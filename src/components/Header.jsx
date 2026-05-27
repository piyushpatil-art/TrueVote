import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Vote } from 'lucide-react';
import WalletButton from './WalletButton';
import { cn } from '../lib/cn';
import { switchToBaseSepolia } from '../contract';

const pages = [
  { id: 'home', label: 'Home' },
  { id: 'vote', label: 'Vote' },
  { id: 'results', label: 'Results' },
  { id: 'admin', label: 'Admin' },
];

export default function Header({
  address,
  onConnect,
  onDisconnect,
  activePage,
  onPageChange,
  isCorrectNetwork,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (id) => {
    onPageChange(id);
    setMobileOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass-nav sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-3 text-left"
          onClick={() => navigate('home')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-glow-sm">
            <Vote size={20} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold gradient-text block leading-tight">TrueVote</span>
            <span className="text-[10px] text-white/40 uppercase tracking-widest">Base Sepolia</span>
          </div>
        </motion.button>

        <nav className="hidden md:flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => navigate(page.id)}
              className={cn(
                'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                activePage === page.id ? 'text-white' : 'text-white/50 hover:text-white/80',
              )}
            >
              {activePage === page.id && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-blue-600/30 border border-violet-500/20 rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{page.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {address && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={async () => {
                try {
                  await switchToBaseSepolia();
                } catch (err) {
                  console.error('Error switching network:', err);
                }
              }}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border shadow-sm',
                isCorrectNetwork
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse hover:bg-rose-500/20 hover:border-rose-500/40 shadow-rose-950/20'
              )}
            >
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full relative flex',
                  isCorrectNetwork ? 'bg-emerald-400' : 'bg-rose-400'
                )}
              >
                {!isCorrectNetwork && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                )}
              </span>
              {isCorrectNetwork ? 'Base Sepolia' : 'Wrong Network'}
            </motion.button>
          )}
          <WalletButton address={address} onConnect={onConnect} onDisconnect={onDisconnect} />
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-white/70 hover:bg-white/10"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/[0.06] overflow-hidden"
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              {pages.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => navigate(page.id)}
                  className={cn(
                    'px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors',
                    activePage === page.id
                      ? 'bg-violet-600/20 text-white border border-violet-500/30'
                      : 'text-white/60 hover:bg-white/5',
                  )}
                >
                  {page.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
