import React, { useEffect, useContext } from 'react';
import useOrchestratorStore from '../store/orchestratorStore';
import socket from '../services/socketService';

// Create a context (though we are using zustand, we can still use context for the socket)
const SocketContext = React.createContext();

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    // Socket handlers moved to socketService.js to prevent duplicate registration
    
    // Cleanup
    return () => {};
  }, []);

  // We can also expose the socket if needed, but for now we just use the store
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};