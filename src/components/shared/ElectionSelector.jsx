import React from 'react';
import { getStatusMeta } from '../../utils/electionHelpers';
import Badge from '../Badge';

export default function ElectionSelector({
  elections,
  value,
  onChange,
  label = 'Select election',
  filter,
  className = '',
}) {
  const filtered = filter ? elections.filter(filter) : elections;

  return (
    <div className={className}>
      <label className="block text-white/60 text-sm font-semibold mb-2">{label}</label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white focus:border-purple-500 outline-none"
      >
        <option value="">— Choose an election —</option>
        {filtered.map((e) => {
          const meta = getStatusMeta(e.status);
          return (
            <option key={e.id} value={e.id}>
              #{e.id} {e.title} ({meta.label})
            </option>
          );
        })}
      </select>
      {value && (
        <div className="mt-2">
          {(() => {
            const e = elections.find((x) => x.id === value);
            if (!e) return null;
            const meta = getStatusMeta(e.status);
            return <Badge variant={meta.variant}>{meta.label}</Badge>;
          })()}
        </div>
      )}
    </div>
  );
}
