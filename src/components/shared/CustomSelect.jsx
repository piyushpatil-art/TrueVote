import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Choose…',
  className = '',
  renderOption = (opt) => opt.label,
  renderValue = (opt) => opt.label,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const buttonRef = useRef(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target) && !buttonRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div className={cn('relative w-full', className)}>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-left flex items-center justify-between hover:bg-white/[0.06] transition-colors"
      >
        <span>{selected ? renderValue(selected) : placeholder}</span>
        <ChevronDown size={18} className={cn('text-white/40 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0d0a21] rounded-2xl border border-white/10 shadow-glow-lg overflow-hidden"
          >
            <div className="p-3 border-b border-white/10">
              <input
                autoFocus
                type="text"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-premium text-sm"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-white/40 text-sm">
                  No options found
                </div>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      'w-full text-left px-4 py-3 transition-colors border-b border-white/5 last:border-b-0',
                      value === opt.value
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {renderOption(opt)}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
