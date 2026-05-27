import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Shield,
  Lock,
  Eye,
  Wallet,
  Vote,
  BarChart3,
  LayoutGrid,
  Zap,
} from 'lucide-react';
import GlassCard from './GlassCard';
import Button from './Button';
import StatCard from './StatCard';
import BlockchainBackground from './shared/BlockchainBackground';
import { usePlatformStats } from '../hooks/usePlatformStats';

const highlightStyles = {
  purple: 'from-purple-600 to-violet-500',
  blue: 'from-sky-600 to-blue-500',
  cyan: 'from-cyan-500 to-sky-500',
};

export default function LandingPage({ onConnect, onNavigate }) {
  const { electionsHeld, votesCast, activeElections, loading } = usePlatformStats();

  const highlights = [
    {
      icon: Lock,
      title: 'Tamper-proof',
      description: 'Every vote is immutably recorded on Base Sepolia.',
      color: 'purple',
    },
    {
      icon: Zap,
      title: 'Gas-free',
      description: 'Vote via UGF — pay in TYI, not ETH gas.',
      color: 'blue',
    },
    {
      icon: Eye,
      title: 'Transparent',
      description: 'Results are public and verifiable on-chain.',
      color: 'cyan',
    },
  ];

  const steps = [
    {
      step: '01',
      icon: Wallet,
      title: 'Connect wallet',
      description: 'Link MetaMask on Base Sepolia and verify your identity.',
    },
    {
      step: '02',
      icon: Vote,
      title: 'Select election',
      description: 'Choose an active election you are whitelisted for.',
    },
    {
      step: '03',
      icon: BarChart3,
      title: 'Cast gasless vote',
      description: 'Submit your vote once — secured by UGF sponsorship.',
    },
  ];

  const formatStat = (n) => (loading ? '—' : n.toLocaleString());

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative px-6 pt-16 pb-24 overflow-hidden">
        <BlockchainBackground />
        <div className="absolute inset-x-0 top-0 h-[360px] bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-purple-400 text-sm font-semibold tracking-widest uppercase mb-4">
                Decentralized democracy
              </p>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-white">
                Secure. Transparent.
                <span className="block mt-3 gradient-text">Trustless Voting.</span>
              </h1>
              <p className="text-lg text-white/65 mb-8 max-w-2xl">
                TrueVote runs on-chain elections with isolated ballots, voter whitelists,
                and gasless voting powered by the Universal Gas Framework.
              </p>

              <motion.div
                className="flex flex-wrap gap-3 mb-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {highlights.map((h) => (
                  <div
                    key={h.title}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/80 transition-all hover:bg-white/10"
                  >
                    <h.icon size={16} className="text-violet-300" />
                    {h.title}
                  </div>
                ))}
              </motion.div>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={onConnect}>
                  <span className="flex items-center gap-2">
                    Cast Your Vote <ArrowRight size={20} />
                  </span>
                </Button>
                <Button size="lg" variant="secondary" onClick={() => onNavigate('results')}>
                  View Results
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative w-[420px] h-[420px] rounded-[2.5rem] overflow-hidden">
                <div className="absolute -left-10 top-10 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl animate-blob" />
                <div className="absolute -right-10 bottom-8 w-56 h-56 rounded-full bg-sky-500/15 blur-3xl animate-blob animation-delay-2000" />
                <div className="relative w-full h-full glass-lg border border-white/10 flex flex-col items-center justify-center gap-8 p-8 shadow-glow-lg">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-600 to-blue-500 grid place-items-center shadow-glow">
                    <Shield size={52} className="text-white" />
                  </div>
                  <Vote size={72} className="text-white/80" />
                  <p className="text-white/60 text-center max-w-sm">
                    Secure ballots, strong proofs, and a premium interface for confident voting.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StatCard label="Elections held" value={formatStat(electionsHeld)} icon={LayoutGrid} color="purple" />
            <StatCard label="Votes cast" value={formatStat(votesCast)} icon={BarChart3} color="blue" />
            <StatCard label="Active elections" value={formatStat(activeElections)} icon={Shield} color="cyan" />
          </motion.div>
        </div>
      </section>

      <section className="px-6 py-24 border-t border-white/5 overflow-hidden">
        <div className="max-w-6xl mx-auto relative">
          <div className="absolute left-1/2 top-12 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <motion.div
            className="text-center mb-14 relative z-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-3">
              How it <span className="gradient-text">works</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Three simple steps from wallet connect to verified on-chain vote.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="h-full rounded-[2rem] overflow-hidden" hover>
                  <div className="absolute inset-x-6 top-6 h-1 rounded-full bg-gradient-to-r from-violet-500/60 to-blue-400/40" />
                  <div className="relative pt-8 text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950/70 border border-white/10 shadow-glow">
                      <item.icon size={28} className="text-white" />
                    </div>
                    <div className="text-sm font-semibold text-white/50 mb-2">Step {item.step}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 bg-slate-950/70">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-white/5 px-4 py-2 text-sm text-white/70 mb-6">
              <Shield size={16} className="text-violet-300" /> Built for trust
            </span>
            <h2 className="text-4xl font-bold text-white mb-4">
              Real election infrastructure with <span className="gradient-text">clarity</span>.
            </h2>
            <p className="text-white/60 max-w-xl">
              TrueVote blends on-chain security with polished usability so admins and voters both know what happens next.
            </p>

            <div className="mt-10 space-y-4">
              <GlassCard className="border border-white/10 p-6 glow-ring" hover>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase text-violet-300 tracking-[0.25em] mb-2">Election-ready</p>
                    <h3 className="text-xl font-semibold text-white">Audit-grade ballot flow</h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-blue-500 text-white">
                    <LayoutGrid size={20} />
                  </div>
                </div>
                <p className="text-white/60 mt-4 text-sm">
                  Every ballot, candidate and vote event is built for on-chain verification.
                </p>
              </GlassCard>

              <GlassCard className="border border-white/10 p-6" hover>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase text-cyan-300 tracking-[0.25em] mb-2">Whitelisted voting</p>
                    <h3 className="text-xl font-semibold text-white">Gasless voter experience</h3>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 to-sky-500 text-white">
                    <Shield size={20} />
                  </div>
                </div>
                <p className="text-white/60 mt-4 text-sm">
                  Voters cast ballots without worrying about gas, while organizers keep full on-chain control.
                </p>
              </GlassCard>
            </div>
          </motion.div>

          <div className="grid gap-6">
            {highlights.map((f, idx) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
              >
                <div className="glass rounded-3xl p-6 border border-white/10 shadow-glow-sm transition-transform duration-300 hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-3xl bg-gradient-to-br ${highlightStyles[f.color]} flex items-center justify-center mb-5 shadow-glow-sm`}>
                    <f.icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <motion.div
          className="max-w-4xl mx-auto glass rounded-3xl p-12 border border-purple-500/30 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <BlockchainBackground className="opacity-40" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4 text-white">Ready to vote?</h2>
            <p className="text-white/60 mb-8 text-lg">
              Join a whitelist election and cast your ballot gaslessly on Base Sepolia.
            </p>
            <Button size="lg" onClick={onConnect}>
              Connect Wallet
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
