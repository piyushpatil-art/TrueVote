import React from 'react';
import { Vote } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStatusMeta } from '../../utils/electionHelpers';
import Badge from '../Badge';
import CustomSelect from './CustomSelect';
import { cn } from '../../lib/cn';

export default function ElectionSelector({
  elections,
  value,
  onChange,
  label = 'Select election',
  filter,
  className = '',
}) {
  const filtered = filter ? elections.filter(filter) : elections;
  const selected = elections.find((e) => e.id === value);

  const options = filtered.map((e) => {
    const meta = getStatusMeta(e.status);
    return {
      value: e.id,
      label: `#${e.id} · ${e.title} (${meta.label})`,
      data: e,
    };
  });

  return (
    <div className={cn('glass-premium rounded-2xl p-5 border border-white/10', className)}>
      <label className="flex items-center gap-2 text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">
        <Vote size={14} className="text-violet-400" />
        {label}
      </label>
      <CustomSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Choose an election…"
      />
      {selected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2"
        >
          <Badge variant={getStatusMeta(selected.status).variant}>
            {getStatusMeta(selected.status).label}
          </Badge>
          <span className="text-white/40 text-xs">{selected.candidateCount} candidates</span>
        </motion.div>
      )}
    </div>
  );
}
