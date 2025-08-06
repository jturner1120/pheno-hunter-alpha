import React from 'react';
import { useAuth } from '../hooks/useAuth';

const AuthDebug = () => {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg text-sm max-w-sm z-50 border-2 border-yellow-400">
      <div className="font-bold text-lg mb-2">🔧 AUTH DEBUG</div>
      <div><strong>Loading:</strong> {loading ? '⏳ true' : '✅ false'}</div>
      <div><strong>Authenticated:</strong> {isAuthenticated ? '✅ true' : '❌ false'}</div>
      <div><strong>User:</strong></div>
      <pre className="text-xs bg-black p-2 rounded mt-1 overflow-auto max-h-32">
        {user ? JSON.stringify(user, null, 2) : 'null'}
      </pre>
    </div>
  );
};

export default AuthDebug;
