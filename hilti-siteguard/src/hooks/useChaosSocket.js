import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useChaosSocket(onEvent) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    // Determine backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5555';

    // Connect to WebSocket namespace
    const chaosSocket = io(`${backendUrl}/chaos-cure`, {
      path: '/socket.io/',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    chaosSocket.on('connect', () => {
      console.log('[CHAOS] Connected to backend');
      setConnected(true);
    });

    chaosSocket.on('disconnect', () => {
      console.log('[CHAOS] Disconnected from backend');
      setConnected(false);
    });

    // Listen for all incident events
    [
      'incident:started',
      'incident:cost-update',
      'incident:risk-assessed',
      'incident:cure-executed',
      'incident:approval-needed',
      'incident:approved',
      'incident:denied',
      'incident:rolled-back',
      'incident:notified',
    ].forEach(event => {
      chaosSocket.on(event, (data) => {
        if (onEventRef.current) {
          onEventRef.current(event, data);
        }
      });
    });

    chaosSocket.on('policy-updated', (data) => {
      if (onEventRef.current) {
        onEventRef.current('policy-updated', data);
      }
    });

    socketRef.current = chaosSocket;

    return () => {
      chaosSocket.disconnect();
    };
  }, []);

  const triggerIncident = useCallback(
    async (scenarioId) => {
      try {
        const response = await fetch('http://localhost:5555/api/chaos/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scenarioId }),
        });
        const data = await response.json();
        if (response.ok) {
          return data;
        } else {
          console.error('Trigger failed:', data);
          return null;
        }
      } catch (err) {
        console.error('Trigger error:', err);
        return null;
      }
    },
    []
  );

  const approveIncident = useCallback(
    async (incidentId) => {
      try {
        const response = await fetch(`http://localhost:5555/api/chaos/${incidentId}/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        return await response.json();
      } catch (err) {
        console.error('Approve error:', err);
        return null;
      }
    },
    []
  );

  const denyIncident = useCallback(
    async (incidentId) => {
      try {
        const response = await fetch(`http://localhost:5555/api/chaos/${incidentId}/deny`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        return await response.json();
      } catch (err) {
        console.error('Deny error:', err);
        return null;
      }
    },
    []
  );

  const rollbackIncident = useCallback(
    async (incidentId) => {
      try {
        const response = await fetch(`http://localhost:5555/api/chaos/${incidentId}/rollback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        return await response.json();
      } catch (err) {
        console.error('Rollback error:', err);
        return null;
      }
    },
    []
  );

  const setPolicy = useCallback(
    (policyId) => {
      if (socketRef.current) {
        socketRef.current.emit('set-policy', policyId);
      }
    },
    []
  );

  return {
    connected,
    socket: socketRef.current,
    triggerIncident,
    approveIncident,
    denyIncident,
    rollbackIncident,
    setPolicy,
  };
}
