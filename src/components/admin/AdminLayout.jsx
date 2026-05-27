import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Vote,
  Users,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '../../lib/cn';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'elections', icon: Vote, label: 'Elections' },
  { id: 'voters', icon: Users, label: 'Voters' },
];

export default function AdminLayout({
  children,
  title,
  subtitle,
  onBack,
  showBack,
  headerAction,
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="p-4 lg:p-6">
          <p className="text-[10px] uppercase tracking-widest text-violet-400/80 font-semibold mb-4">
            Admin Console
          </p>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {navItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap',
                  item.id === 'dashboard'
                    ? 'bg-violet-600/15 text-white border border-violet-500/25'
                    : 'text-white/45',
                )}
              >
                <item.icon size={18} className={item.id === 'dashboard' ? 'text-violet-400' : ''} />
                {item.label}
              </div>
            ))}
          </nav>
          <div className="hidden lg:block mt-8 p-4 rounded-xl bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/15">
            <Settings size={16} className="text-violet-400 mb-2" />
            <p className="text-xs text-white/50 leading-relaxed">
              Manage elections, candidates, and voter whitelists on Base Sepolia.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-start justify-between gap-4 mb-8"
          >
            <div>
              {showBack && onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-3 transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                {title || 'Dashboard'}
              </h1>
              {subtitle && <p className="text-white/50 text-sm mt-1">{subtitle}</p>}
            </div>
            {headerAction}
          </motion.div>
          {children}
        </div>
      </main>
    </div>
  );
}
