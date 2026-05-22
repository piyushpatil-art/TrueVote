import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './components/DashboardLayout';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import VoterPage from './components/voter/VoterPage';
import ResultsPage from './components/results/ResultsPage';
import AdminDashboard from './components/admin/AdminDashboard';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) setWalletAddress(accounts[0]);
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
      window.ethereum.on('accountsChanged', onAccounts);
      return () => window.ethereum.removeListener('accountsChanged', onAccounts);
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

  const walletGate = (page, component) => {
    if (currentPage !== page) return null;
    if (walletAddress) return component;
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="glass rounded-2xl p-12 text-center border border-white/10">
          <p className="text-white text-lg mb-6">Connect your wallet to continue</p>
          <button type="button" onClick={handleConnect} className="btn-primary px-8 py-3 rounded-lg">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <Header
        address={walletAddress}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        activePage={currentPage}
        onPageChange={setCurrentPage}
      />

      <main className="max-w-7xl mx-auto">
        {currentPage === 'home' && (
          <LandingPage onConnect={handleConnect} onNavigate={setCurrentPage} />
        )}
        {currentPage === 'vote' && <VoterPage address={walletAddress} />}
        {currentPage === 'results' && <ResultsPage />}
        {walletGate('admin', <AdminDashboard address={walletAddress} />)}
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(26, 26, 46, 0.95)',
            color: '#fff',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </DashboardLayout>
  );
}

export default App;
