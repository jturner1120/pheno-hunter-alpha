import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const AuthDebug = () => {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <div><strong>Auth Debug:</strong></div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
      <div>User: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
    </div>
  );
};

export default AuthDebug;
