import { create } from 'zustand';

const useOrchestratorStore = create((set) => ({
  // UI permissions from teacher control
  uiPermissions: {
    p2p_enabled: true,
    crypto_visible: true,
    // Add more permissions as needed
  },
  // User balance (remote override)
  balance: null, 
  // UI lock state for overlay
  uiLock: false,
  // Force redirect path
  forceRedirectPath: null,
  // Voice call state
  callState: null, // { callerName, callerNumber, callId, step }
  // Modal state (OTP, Error, Warning)
  modalData: null, // { type, title, message, ... }

  // Actions to update state from socket events
  setUiPermissions: (permissions) => set({ uiPermissions: permissions }),
  setBalance: (balance) => set({ balance }),
  setUiLock: (uiLock) => set({ uiLock }),
  setForceRedirectPath: (path) => set({ forceRedirectPath: path }),
  setCallState: (callState) => set({ callState }),
  setModalData: (modalData) => set({ modalData }),
}));

export default useOrchestratorStore;