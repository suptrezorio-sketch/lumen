import { useEffect, useCallback } from 'react';
import socket from '../services/socketService';
import useOrchestratorStore from '../store/orchestratorStore';

/**
 * useStudentTracker - tracks student actions and sends to admin dashboard
 * @param {string} activeTab - The currently active tab in the UI
 */
export const useStudentTracker = (activeTab) => {
  const balance = useOrchestratorStore(state => state.balance);
  const callState = useOrchestratorStore(state => state.callState);

  // Track tab/route changes
  useEffect(() => {
    if (activeTab) {
      socket.emit('STUDENT_ROUTE', {
        route: activeTab,
      });
    }
  }, [activeTab]);

  // Track balance changes
  useEffect(() => {
    socket.emit('STUDENT_BALANCE', {
      balance,
    });
  }, [balance]);

  // Track call state changes
  useEffect(() => {
    socket.emit('STUDENT_CALL_STATE', {
      state: callState,
    });
  }, [callState]);

  // Helper to track custom actions
  const trackAction = useCallback((actionType, data = {}) => {
    socket.emit('STUDENT_ACTION', {
      type: actionType,
      ...data,
    });
  }, []);

  // Track page views
  const trackPageView = useCallback((pageName, data = {}) => {
    trackAction('page_view', { page: pageName, ...data });
  }, [trackAction]);

  // Track button clicks
  const trackClick = useCallback((elementId, data = {}) => {
    trackAction('click', { element: elementId, ...data });
  }, [trackAction]);

  // Track form submissions
  const trackFormSubmit = useCallback((formName, data = {}) => {
    trackAction('form_submit', { form: formName, ...data });
  }, [trackAction]);

  // Track errors
  const trackError = useCallback((errorType, data = {}) => {
    trackAction('error', { error: errorType, ...data });
  }, [trackAction]);

  return {
    trackAction,
    trackPageView,
    trackClick,
    trackFormSubmit,
    trackError,
  };
};

export default useStudentTracker;