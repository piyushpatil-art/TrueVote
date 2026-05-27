import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import Button from '../Button';
import { cn } from '../../lib/cn';

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="relative w-full max-w-md glass-premium rounded-2xl p-6 border border-violet-500/20 shadow-glow-lg"
          >
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-4 right-4 text-white/40 hover:text-white p-1"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="flex gap-4 mb-6">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border',
                  variant === 'danger'
                    ? 'bg-red-500/15 border-red-500/30'
                    : 'bg-amber-500/15 border-amber-500/30',
                )}
              >
                <AlertTriangle
                  className={variant === 'danger' ? 'text-red-400' : 'text-amber-400'}
                  size={24}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white pr-6">{title}</h3>
                <p className="text-white/55 text-sm mt-2 leading-relaxed">{message}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={onCancel} disabled={isLoading}>
                {cancelLabel}
              </Button>
              <Button
                className="flex-1"
                variant={variant === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                isLoading={isLoading}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
