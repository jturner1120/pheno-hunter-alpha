// src/components/SessionStatus.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const SessionStatus = () => {
  const { isAuthenticated, securityConfig } = useAuth();
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setSessionInfo(null);
      return;
    }

    const updateSessionInfo = () => {
      const sessionStart = sessionStorage.getItem(securityConfig.SESSION_STORAGE_KEY);
      const lastActivity = sessionStorage.getItem(securityConfig.LAST_ACTIVITY_KEY);
      
      if (sessionStart && lastActivity) {
        const now = Date.now();
        const sessionAge = now - parseInt(sessionStart);
        const timeSinceActivity = now - parseInt(lastActivity);
        
        setSessionInfo({
          sessionAge: Math.floor(sessionAge / 1000),
          timeSinceActivity: Math.floor(timeSinceActivity / 1000),
          maxSessionTime: Math.floor(securityConfig.MAX_SESSION_DURATION / 1000),
          inactivityTimeout: Math.floor(securityConfig.INACTIVITY_TIMEOUT / 1000)
        });
      }
    };

    updateSessionInfo();
    const interval = setInterval(updateSessionInfo, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, securityConfig]);

  if (!isAuthenticated || !sessionInfo) return null;

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-xs max-w-xs">
      <div className="font-semibold text-gray-700 mb-2">Session Info (Debug)</div>
      <div className="space-y-1 text-gray-600">
        <div>Session: {formatTime(sessionInfo.sessionAge)} / {formatTime(sessionInfo.maxSessionTime)}</div>
        <div>Inactive: {formatTime(sessionInfo.timeSinceActivity)} / {formatTime(sessionInfo.inactivityTimeout)}</div>
        <div className="text-xs text-gray-500 mt-2">
          Warning at: {formatTime(sessionInfo.inactivityTimeout - 300)} inactive
        </div>
      </div>
    </div>
  );
};

export default SessionStatus;
