import { useEffect, useRef, useState, useCallback } from 'react';

// MOCK LOCAL ENGINE for Chaos & Cure
// Replaces localhost WebSocket to guarantee it works flawlessly on Vercel
export function useChaosSocket(onEvent) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  
  const stateRef = useRef({
    activeIncidentId: null,
    costTimer: null,
    costAccumulated: 0,
    elapsedSeconds: 0,
    policy: 'balanced'
  });

  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    // Simulate connection
    setTimeout(() => {
      setConnected(true);
      console.log('[CHAOS MOCK] Connected to local engine simulator');
    }, 500);

    return () => {
      if (stateRef.current.costTimer) clearInterval(stateRef.current.costTimer);
    };
  }, []);

  const triggerIncident = useCallback(async (scenarioId) => {
    const id = `INC-${Date.now()}`;
    stateRef.current.activeIncidentId = id;
    stateRef.current.costAccumulated = 0;
    stateRef.current.elapsedSeconds = 0;
    
    // 1. Started
    onEventRef.current('incident:started', {
      incidentId: id,
      scenario: { id: scenarioId, label: scenarioId.replace(/_/g, ' ') }
    });

    // 2. Cost Tick
    stateRef.current.costTimer = setInterval(() => {
      stateRef.current.costAccumulated += Math.random() * 5 + 2;
      stateRef.current.elapsedSeconds += 1;
      onEventRef.current('incident:cost-update', {
        metric: 'Financial Burn',
        value: stateRef.current.costAccumulated,
        elapsedSeconds: stateRef.current.elapsedSeconds
      });
    }, 1000);

    // 3. Risk Assessed (AI Simulation)
    setTimeout(() => {
      if (stateRef.current.activeIncidentId !== id) return;
      
      const tier = stateRef.current.policy === 'aggressive' ? 'TIER_1_AUTO' : 'TIER_3_MANUAL';
      onEventRef.current('incident:risk-assessed', {
        riskScore: { actionScore: 8.5, confidence: 0.95, reversibility: 0.8, blastRadius: 0.2 },
        tier: tier,
        reasoning: "High confidence of resource abuse detected."
      });

      // 4. Action Needed
      setTimeout(() => {
        if (stateRef.current.activeIncidentId !== id) return;
        
        if (tier === 'TIER_3_MANUAL') {
          onEventRef.current('incident:approval-needed', {
            proposedRemediation: { label: 'Terminate Rogue Processes & Isolate Container' }
          });
        } else {
          // Auto execute
          clearInterval(stateRef.current.costTimer);
          onEventRef.current('incident:cure-executed', {
            remediationLabel: 'Auto-Terminated Rogue Workload'
          });
        }
      }, 1500);

    }, 2000);

    return { success: true };
  }, []);

  const approveIncident = useCallback(async (incidentId) => {
    onEventRef.current('incident:approved', { incidentId });
    setTimeout(() => {
      clearInterval(stateRef.current.costTimer);
      onEventRef.current('incident:cure-executed', {
        remediationLabel: 'Terminated Rogue Processes & Isolated Container'
      });
    }, 800);
    return { success: true };
  }, []);

  const denyIncident = useCallback(async (incidentId) => {
    clearInterval(stateRef.current.costTimer);
    onEventRef.current('incident:denied', { incidentId });
    return { success: true };
  }, []);

  const rollbackIncident = useCallback(async (incidentId) => {
    onEventRef.current('incident:rolled-back', { incidentId });
    return { success: true };
  }, []);

  const setPolicy = useCallback((policyId) => {
    stateRef.current.policy = policyId;
    onEventRef.current('policy-updated', { orgId: 'mock-org' });
  }, []);

  return {
    connected,
    socket: null,
    triggerIncident,
    approveIncident,
    denyIncident,
    rollbackIncident,
    setPolicy,
  };
}
