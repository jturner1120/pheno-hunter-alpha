import React from 'react';

const FirebaseConfigCheck = () => {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  return (
    <div className="fixed top-4 left-4 bg-yellow-400 text-black p-4 rounded-lg text-xs max-w-md z-50">
      <div className="font-bold mb-2">🔧 FIREBASE CONFIG CHECK v2</div>
      {Object.entries(config).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {value ? '✅ SET' : '❌ MISSING'}
        </div>
      ))}
    </div>
  );
};

export default FirebaseConfigCheck;
