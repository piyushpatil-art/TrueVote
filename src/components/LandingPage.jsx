import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Lock, Zap, Users } from 'lucide-react';
import GlassCard from './GlassCard';
import Button from './Button';
import StatCard from './StatCard';

export default function LandingPage({ onConnect, onNavigate }) {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Transparent',
      description: 'All votes are recorded on the blockchain and cannot be tampered with.',
    },
    {
      icon: Lock,
      title: 'Private & Anonymous',
      description: 'Your vote is encrypted. Only the result is public.',
    },
    {
      icon: Zap,
      title: 'Gasless Voting',
      description: 'No gas fees required. UGF handles everything behind the scenes.',
    },
    {
      icon: Users,
      title: 'Fair & Democratic',
      description: 'One wallet, one vote. Impossible to vote twice.',
    },
  ];

  const stats = [
    { label: 'Total Elections', value: '2,847', icon: Users, color: 'purple' },
    { label: 'Votes Cast', value: '892K+', icon: Zap, color: 'blue' },
    { label: 'Active Voters', value: '156K+', icon: Shield, color: 'cyan' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 80%, rgba(37, 99, 235, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)',
              ],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center mb-12"
          >
            <motion.h1
              className="text-6xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Secure Blockchain Voting
              </span>
              <br />
              <span className="text-white">For Everyone</span>
            </motion.h1>

            <motion.p
              className="text-xl text-white/60 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Experience transparent, secure, and decentralized voting on the blockchain. One vote, one voice.
            </motion.p>

            <motion.div
              className="flex gap-4 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Button size="lg" onClick={onConnect}>
                <span className="flex items-center gap-2">
                  Connect Wallet <ArrowRight size={20} />
                </span>
              </Button>
              <Button size="lg" variant="secondary" onClick={() => onNavigate('vote')}>
                Start Voting
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {stats.map((stat, idx) => (
              <StatCard key={idx} {...stat} delay={0.1 * idx} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Why Choose <span className="gradient-text">TrueVote?</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + idx * 0.1 }}
              >
                <GlassCard className="h-full" delay={1.1 + idx * 0.1}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <feature.icon size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-white/60">{feature.description}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-20">
        <motion.div
          className="max-w-4xl mx-auto glass rounded-3xl p-12 border border-purple-500/30 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Vote?</h2>
          <p className="text-white/60 mb-8 text-lg">Join thousands of secure voters on the blockchain today.</p>
          <Button size="lg" onClick={onConnect}>
            Connect Your Wallet
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
