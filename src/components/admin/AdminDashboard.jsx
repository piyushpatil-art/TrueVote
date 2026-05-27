import React from 'react';
import AdminPage from './AdminPage';

// New enhanced admin dashboard with premium Web3 UI
export default function AdminDashboard({ address, onDisconnect }) {
  return <AdminPage address={address} onDisconnect={onDisconnect} />;
}
