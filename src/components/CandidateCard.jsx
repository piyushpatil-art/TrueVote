import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

export default function CandidateCard({
  id,
  name,
  party,
  votes,
  isSelected,
  onSelect,
  hasVoted,
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => !hasVoted && onSelect(id)}
      className={`glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
        isSelected
          ? 'border-purple-500 shadow-glow-lg'
          : 'border-white/10 hover:border-purple-500/50'
      } ${hasVoted ? 'opacity-75' : ''}`}
    >
      <div className="flex gap-4 p-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center border border-white/20">
            <span className="text-2xl font-bold text-white">{name.charAt(0)}</span>
          </div>
          
          {/* Selection Indicator */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 rounded-xl border-2 border-purple-400 flex items-center justify-center"
              >
                <div className="bg-purple-500 rounded-full p-1">
                  <Check size={12} className="text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
          <p className="text-blue-300 text-sm mb-3 font-semibold">{party}</p>
          
          {/* Vote Count */}
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{votes}</span>
            </div>
            <span className="text-white/60 text-sm">votes</span>
          </motion.div>
        </div>

        {/* Radio Button */}
        <motion.div
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            isSelected
              ? 'border-purple-400 bg-purple-500'
              : 'border-white/30 hover:border-purple-400'
          }`}
          whileHover={{ scale: 1.1 }}
        >
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
