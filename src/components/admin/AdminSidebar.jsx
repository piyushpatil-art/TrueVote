import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Vote,
  Users,
  Zap,
  LogOut,
  Network,
} from 'lucide-react';
import { cn } from '../../lib/cn';

const navItems = [
  { id: 'home', icon: LayoutDashboard, label: 'Dashboard', section: 'main' },
  { id: 'elections', icon: Vote, label: 'Elections', section: 'main' },
  { id: 'candidates', icon: Users, label: 'Candidates', section: 'main' },
  { id: 'voters', icon: Zap, label: 'Voters', section: 'main' },
];

export default function AdminSidebar({
  currentPage,
  onNavigate,
  address,
  onDisconnect,
  isOpen = true,
  onClose,
}) {
  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const groupedItems = {
    main: navItems.filter((item) => item.section === 'main'),
    secondary: navItems.filter((item) => item.section === 'secondary'),
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-white/[0.06]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-1"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Vote size={20} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">TrueVote</div>
            <div className="text-xs text-violet-400">Admin Control</div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {/* Main Navigation */}
        {groupedItems.main.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-violet-400/60 font-semibold px-3 mb-3">
              Navigation
            </p>
            {groupedItems.main.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose?.();
                  }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/30 to-blue-600/20 text-white border border-violet-500/40 shadow-lg shadow-violet-600/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon size={18} className={isActive ? 'text-violet-400' : ''} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-blue-400"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Secondary Navigation */}
        {groupedItems.secondary.length > 0 && (
          <div className="pt-4 border-t border-white/[0.06] mt-4">
            <p className="text-xs uppercase tracking-widest text-violet-400/60 font-semibold px-3 mb-3">
              Management
            </p>
            {groupedItems.secondary.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose?.();
                  }}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/30 to-blue-600/20 text-white border border-violet-500/40 shadow-lg shadow-violet-600/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  )}
                >
                  <item.icon size={18} className={isActive ? 'text-violet-400' : ''} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-blue-400"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 lg:p-6 border-t border-white/[0.06] space-y-3">
        {/* Network Status */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Network size={14} className="text-blue-400" />
            <span className="text-xs text-blue-400 font-semibold">Base Sepolia</span>
          </div>
          <div className="text-xs text-white/60">Connected Network</div>
        </div>

        {/* Wallet Info */}
        {address && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-gradient-to-br from-violet-600/10 to-pink-600/10 border border-violet-500/20"
          >
            <div className="text-xs text-white/60 mb-1">Admin Wallet</div>
            <div className="font-mono text-xs text-violet-300 mb-2">{truncateAddress(address)}</div>
            <button
              onClick={onDisconnect}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 w-64 h-screen border-r border-white/[0.06] bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-xl z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30"
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 w-64 h-screen border-r border-white/[0.06] bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-xl lg:hidden z-40"
          >
            {sidebarContent}
          </motion.aside>
        </>
      )}
    </>
  );
}
