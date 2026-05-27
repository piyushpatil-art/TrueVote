import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Vote,
  Users,
  Zap,
} from 'lucide-react';
import GlassCard from '../GlassCard';

const ActivityFeedItem = ({ activity, index }) => {
  const iconMap = {
    election_created: { Icon: Plus, color: 'violet' },
    election_activated: { Icon: Zap, color: 'blue' },
    election_ended: { Icon: AlertCircle, color: 'red' },
    vote_cast: { Icon: Vote, color: 'emerald' },
    voter_approved: { Icon: CheckCircle, color: 'cyan' },
    candidate_added: { Icon: Users, color: 'pink' },
  };

  const { Icon, color } = iconMap[activity.type] || { Icon: Clock, color: 'gray' };

  const statusClasses = {
    completed: 'border-emerald-500/20 bg-emerald-600/5',
    pending: 'border-amber-500/20 bg-amber-600/5',
    failed: 'border-red-500/20 bg-red-600/5',
  };

  const colorClasses = {
    violet: 'text-violet-400',
    blue: 'text-blue-400',
    red: 'text-red-400',
    emerald: 'text-emerald-400',
    cyan: 'text-cyan-400',
    pink: 'text-pink-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex gap-4 p-4 rounded-lg border ${statusClasses[activity.status] || statusClasses.completed}`}
    >
      <div className={`p-2 rounded-lg bg-${color}-600/20 flex-shrink-0 h-fit`}>
        <Icon size={20} className={colorClasses[color]} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-semibold text-white text-sm">{activity.title}</h4>
          {activity.status === 'pending' && (
            <motion.div
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-amber-400 text-xs font-semibold"
            >
              Pending
            </motion.div>
          )}
        </div>
        <p className="text-xs text-white/50 mb-2">{activity.description}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-white/40">{activity.time}</span>
          {activity.txHash && (
            <a
              href={`https://sepolia.basescan.org/tx/${activity.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:text-violet-300 font-mono truncate"
            >
              {activity.txHash.slice(0, 12)}...
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function ActivityFeed({ activities = [], loading = false }) {
  const mockActivities = [
    {
      type: 'election_created',
      status: 'completed',
      title: 'Election Created',
      description: 'Student Union 2026 initialized on-chain',
      time: 'Just now',
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    },
    {
      type: 'voter_approved',
      status: 'completed',
      title: 'Voter Approved',
      description: '0x742d...e8f1 approved for Student Union 2026',
      time: '2 minutes ago',
      txHash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    },
    {
      type: 'vote_cast',
      status: 'completed',
      title: 'Vote Cast',
      description: 'Vote recorded for Alice Johnson in Student Union 2026',
      time: '5 minutes ago',
      txHash: '0xfedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcbafedcba',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  return (
    <GlassCard hover={false} className="!p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Activity Feed</h3>
          <p className="text-sm text-white/50 mt-1">Recent blockchain transactions</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : displayActivities.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          <Clock size={32} className="mx-auto mb-3 opacity-30" />
          <p>No activities yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayActivities.map((activity, index) => (
            <ActivityFeedItem key={index} activity={activity} index={index} />
          ))}
        </div>
      )}
    </GlassCard>
  );
}
