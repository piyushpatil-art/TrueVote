import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './components/DashboardLayout';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import VoterPage from './components/VoterPage';
import Results from './components/Results';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [walletAddress, setWalletAddress] = useState(null);

  // Initialize wallet connection listener
  useEffect(() => {
    const checkWallet = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        } catch (err) {
          console.error('Error checking wallet:', err);
        }
      }
    };

    checkWallet();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts.length > 0 ? accounts[0] : null);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleConnect = async () => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

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
        {currentPage === 'vote' && walletAddress ? (
          <VoterPage address={walletAddress} />
        ) : currentPage === 'vote' ? (
          <div className="h-96 flex items-center justify-center">
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <p className="text-white text-lg mb-6">Please connect your wallet to vote</p>
              <button
                onClick={handleConnect}
                className="btn-primary px-8 py-3 rounded-lg"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : null}
        {currentPage === 'results' && <Results address={walletAddress} />}
        {currentPage === 'admin' && walletAddress ? (
          <AdminPanel address={walletAddress} />
        ) : currentPage === 'admin' ? (
          <div className="h-96 flex items-center justify-center">
            <div className="glass rounded-2xl p-12 text-center border border-white/10">
              <p className="text-white text-lg mb-6">Please connect your wallet to access admin panel</p>
              <button
                onClick={handleConnect}
                className="btn-primary px-8 py-3 rounded-lg"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : null}
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