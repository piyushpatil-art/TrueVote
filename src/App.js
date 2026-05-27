import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Wallet } from 'lucide-react';
import DashboardLayout from './components/DashboardLayout';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import VoterPage from './components/voter/VoterPage';
import ResultsPage from './components/results/ResultsPage';
import AdminDashboard from './components/admin/AdminDashboard';
import PageTransition from './components/ui/PageTransition';
import Button from './components/Button';
import GlassCard from './components/GlassCard';

import { BASE_SEPOLIA_CHAIN_ID } from './contract';

function WalletGate({ children, walletAddress, onConnect }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4 py-16">
      <GlassCard hover={false} className="max-w-md w-full text-center !p-10">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-600/30 to-blue-600/30 border border-violet-500/30 flex items-center justify-center">
          <Wallet size={32} className="text-violet-300" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Connect your wallet</h2>
        <p className="text-white/50 text-sm mb-8">
          Admin access requires a connected wallet on Base Sepolia.
        </p>
        <Button size="lg" className="w-full" onClick={onConnect}>
          Connect Wallet
        </Button>
      </GlassCard>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [walletAddress, setWalletAddress] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setIsCorrectNetwork(chainId === BASE_SEPOLIA_CHAIN_ID);
        } catch (err) {
          console.error('Error checking wallet:', err);
        }
      }
    };
    checkWallet();

    if (window.ethereum) {
      const onAccounts = (accounts) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : null);
      };
      const onChain = () => {
        window.location.reload();
      };
      window.ethereum.on('accountsChanged', onAccounts);
      window.ethereum.on('chainChanged', onChain);
      return () => {
        window.ethereum.removeListener('accountsChanged', onAccounts);
        window.ethereum.removeListener('chainChanged', onChain);
      };
    }
  }, []);

  const handleConnect = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setIsCorrectNetwork(chainId === BASE_SEPOLIA_CHAIN_ID);
        setCurrentPage('vote');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      alert('Failed to connect wallet');
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onConnect={handleConnect} onNavigate={setCurrentPage} />;
      case 'vote':
        return <VoterPage address={walletAddress} isCorrectNetwork={isCorrectNetwork} />;
      case 'results':
        return <ResultsPage />;
      case 'admin':
        return walletAddress ? (
          <AdminDashboard address={walletAddress} isCorrectNetwork={isCorrectNetwork} onDisconnect={handleDisconnect} />
        ) : (
          <WalletGate walletAddress={walletAddress} onConnect={handleConnect} />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <Header
        address={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        activePage={currentPage}
        onPageChange={setCurrentPage}
        isCorrectNetwork={isCorrectNetwork}
      />

      <main className={currentPage === 'admin' ? '' : 'max-w-7xl mx-auto'}>
        <PageTransition pageKey={currentPage}>{renderPage()}</PageTransition>
      </main>

      <Toaster
        position="top-right"
        gutter={12}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(10, 10, 18, 0.92)',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '14px',
            backdropFilter: 'blur(16px)',
            padding: '14px 18px',
            fontSize: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(124,58,237,0.15)',
          },
          success: {
            iconTheme: { primary: '#34d399', secondary: '#0a0a12' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#0a0a12' },
          },
        }}
      />
    </DashboardLayout>
  );
}

export default App;
