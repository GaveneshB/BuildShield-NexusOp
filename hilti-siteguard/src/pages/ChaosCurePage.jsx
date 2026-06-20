import { useState, useEffect, useRef, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useChaosSocket } from '../hooks/useChaosSocket';

// Icon component for quick reference
const IconCheck = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconAlert = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4v2m0 4h.01m-6.938-4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconRefresh = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
  </svg>
);

export default function ChaosCurePage({ triggerToast }) {
  const [scenarios, setScenarios] = useState([]);
  const [policies, setPolicies] = useState([
    { id: 'conservative', label: 'Conservative' },
    { id: 'balanced', label: 'Balanced' },
    { id: 'aggressive', label: 'Aggressive' },
  ]);
  const [activePolicy, setActivePolicy] = useState('balanced');
  const [selectedScenario, setSelectedScenario] = useState(null);

  const [incidentId, setIncidentId] = useState(null);
  const [incident, setIncident] = useState(null);
  const [logs, setLogs] = useState(['[*] System secure. Ready for testing.']);
  const [telemetry, setTelemetry] = useState([]);
  const [running, setRunning] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const logRef = useRef(null);
  const { connected, triggerIncident, approveIncident, denyIncident, rollbackIncident, setPolicy } = useChaosSocket(
    handleWebSocketEvent
  );

  function handleWebSocketEvent(event, data) {
    console.log('[CHAOS EVENT]', event, data);

    if (event === 'incident:started') {
      setIncidentId(data.incidentId);
      setIncident({
        incidentId: data.incidentId,
        scenario: data.scenario,
        status: 'active',
        tier: null,
        costAccumulated: 0,
        elapsedSeconds: 0,
        riskScore: null,
        approvalNeeded: false,
      });
      addLog(`[CHAOS] Incident started: ${data.scenario.label}`);
      setRunning(true);
    }

    if (event === 'incident:cost-update') {
      addLog(`[COST] ${data.metric}: ${typeof data.value === 'number' ? data.value.toFixed(2) : data.value}`);
      setIncident(prev => ({
        ...prev,
        costAccumulated: data.value,
        elapsedSeconds: data.elapsedSeconds,
      }));
    }

    if (event === 'incident:risk-assessed') {
      addLog(`[RISK] Score: ${data.riskScore.actionScore.toFixed(2)} → ${data.tier}`);
      addLog(`[REASONING] ${data.reasoning}`);
      setIncident(prev => ({
        ...prev,
        riskScore: data.riskScore,
        tier: data.tier,
      }));
    }

    if (event === 'incident:approval-needed') {
      addLog(`[WAIT] Awaiting approval: ${data.proposedRemediation.label}`);
      setIncident(prev => ({
        ...prev,
        approvalNeeded: true,
        proposedRemediation: data.proposedRemediation,
      }));
      triggerToast('Manual approval required for this action', 'warning');
    }

    if (event === 'incident:cure-executed') {
      addLog(`[CURE] ✓ Executed: ${data.remediationLabel}`);
      setIncident(prev => ({
        ...prev,
        status: 'cured',
        approvalNeeded: false,
      }));
      triggerToast(`Incident resolved: ${data.remediationLabel}`, 'success');
      setRunning(false);
    }

    if (event === 'incident:approved') {
      addLog(`[APPROVE] Action approved by human`);
    }

    if (event === 'incident:denied') {
      addLog(`[DENY] Action denied by human`);
      setRunning(false);
    }

    if (event === 'incident:rolled-back') {
      addLog(`[ROLLBACK] Action reversed`);
    }
  }

  function addLog(msg) {
    setLogs(prev => [...prev, msg]);
  }

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Fetch scenarios on mount
  useEffect(() => {
    fetch('http://localhost:5555/api/chaos/scenarios')
      .then(r => r.json())
      .then(data => {
        setScenarios(data);
        if (data.length > 0) setSelectedScenario(data[0].id);
      })
      .catch(err => console.error('Failed to fetch scenarios:', err));
  }, []);

  // Simulate telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const next = [...prev.slice(1)];
        let cpu = 8 + Math.random() * 4;
        let network = 12 + Math.random() * 5;

        if (running && incident?.status === 'active') {
          cpu = 85 + Math.random() * 14;
          network = 800 + Math.random() * 100;
        } else if (running && incident?.status === 'cured') {
          cpu = 12 + Math.random() * 6;
          network = 20 + Math.random() * 10;
        }

        next.push({ time: prev.length, cpu, network });
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running, incident?.status]);

  const handleTrigger = async () => {
    if (!connected) {
      triggerToast('Backend not connected', 'warning');
      return;
    }
    setAiAnalyzing(true);
    addLog('[AI] 🤖 Gemini is analyzing the threat...');
    try {
      await triggerIncident(selectedScenario);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleApprove = () => {
    if (incidentId) {
      approveIncident(incidentId);
    }
  };

  const handleDeny = () => {
    if (incidentId) {
      denyIncident(incidentId);
    }
  };

  const handleRollback = () => {
    if (incidentId) {
      rollbackIncident(incidentId);
    }
  };

  const handlePolicyChange = (policyId) => {
    setActivePolicy(policyId);
    setPolicy(policyId);
    triggerToast(`Policy switched to: ${policies.find(p => p.id === policyId)?.label}`, 'info');
  };

  const handleReset = () => {
    setIncidentId(null);
    setIncident(null);
    setLogs(['[*] System secure. Ready for testing.']);
    setRunning(false);
    triggerToast('Demo reset', 'info');
  };

  const currentCpu = telemetry[telemetry.length - 1]?.cpu || 0;
  const currentNet = telemetry[telemetry.length - 1]?.network || 0;

  const getTierColor = tier => {
    if (!tier) return 'bg-slate-50 border-slate-200 text-slate-600';
    if (tier === 'TIER_1_AUTO') return 'bg-green-50 border-green-200 text-green-600';
    if (tier === 'TIER_2_AUTO_NOTIFY') return 'bg-blue-50 border-blue-200 text-blue-600';
    return 'bg-orange-50 border-orange-200 text-orange-600';
  };

  const getTierLabel = tier => {
    if (!tier) return 'Waiting...';
    if (tier === 'TIER_1_AUTO') return 'Auto-Resolved';
    if (tier === 'TIER_2_AUTO_NOTIFY') return 'Auto + Notify';
    return 'Needs Approval';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">⚡ Chaos & Cure AI Demo Engine</h2>
          <p className="text-slate-500 text-sm">
            Real incident-response state machine. Select a threat scenario to trigger.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              connected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
          >
            {connected ? '● Connected' : '● Disconnected'}
          </div>
        </div>
      </div>

      {/* Policy Selector */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Org Policy Profile</span>
            <p className="text-sm text-slate-600 mt-1">Risk tolerance controls tier assignment for the same scenario</p>
          </div>

          <div className="flex gap-2">
            {policies.map(p => (
              <button
                key={p.id}
                onClick={() => handlePolicyChange(p.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                  activePolicy === p.id
                    ? 'bg-rose-400 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scenario Picker */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Threat Scenario
            </label>
            <select
              value={selectedScenario || ''}
              onChange={e => setSelectedScenario(e.target.value)}
              disabled={running}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold outline-none focus:border-rose-300 transition disabled:opacity-50"
            >
              {scenarios.map(s => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTrigger}
              disabled={running || !connected || aiAnalyzing}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition flex items-center gap-2 ${
                running || !connected || aiAnalyzing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-rose-400 hover:bg-rose-500 text-white active-pulse'
              }`}
            >
              {aiAnalyzing ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  AI Analyzing...
                </>
              ) : 'Trigger Incident'}
            </button>

            <button
              onClick={handleReset}
              disabled={running}
              className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-400 transition disabled:opacity-50"
              title="Reset demo"
            >
              <IconRefresh className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Log */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between px-4 py-3 bg-white/80 border border-b-0 border-slate-200 rounded-t-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="w-3 h-3 rounded-full bg-teal-400" />
              <span className="text-xs font-mono text-slate-400 ml-2">chaos-incident-terminal</span>
            </div>

            <span className="text-[10px] font-mono uppercase text-slate-400">
              {running ? 'Processing...' : 'Ready'}
            </span>
          </div>

          <div
            ref={logRef}
            className="border border-t-0 rounded-b-2xl p-5 h-80 overflow-y-auto backdrop-blur-md shadow-sm bg-slate-50 border-slate-200 font-mono text-xs text-slate-600"
          >
            {logs.map((log, i) => (
              <div key={i} className="leading-relaxed">
                {log}
              </div>
            ))}
            {running && (
              <div className="flex items-center gap-1.5 opacity-60 animate-pulse mt-2">
                <span className="w-1.5 h-3 bg-slate-600" />
                <span>Processing...</span>
              </div>
            )}
          </div>
        </div>

        {/* Risk & Status Panel */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Incident Status</h3>
            <p className="text-xs text-slate-400">Real-time decision tracking</p>
          </div>

          {incident ? (
            <div className="space-y-4">
              {/* Tier Badge */}
              <div
                className={`p-4 rounded-xl border ${getTierColor(incident.tier)} space-y-2`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">Decision Tier</span>
                <span className="text-lg font-bold">{getTierLabel(incident.tier)}</span>
              </div>

              {/* Risk Score Gauges */}
              {incident.riskScore && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Confidence</span>
                      <span className="font-mono font-bold">
                        {(incident.riskScore.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-400"
                        style={{ width: `${incident.riskScore.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Reversibility</span>
                      <span className="font-mono font-bold">
                        {(incident.riskScore.reversibility * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-400"
                        style={{ width: `${incident.riskScore.reversibility * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Blast Radius</span>
                      <span className="font-mono font-bold">
                        {(incident.riskScore.blastRadius * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-400"
                        style={{ width: `${incident.riskScore.blastRadius * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cost Counter */}
              {incident.costAccumulated !== undefined && (
                <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg text-center space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Cost of Inaction</span>
                  <div className="text-xl font-bold text-orange-600 font-mono">
                    ${incident.costAccumulated.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Approval Panel */}
              {incident.approvalNeeded && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-600 text-sm font-bold">
                    <IconAlert className="w-4 h-4" />
                    Awaiting Approval
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleApprove}
                      className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white font-bold text-xs rounded-lg transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={handleDeny}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition"
                    >
                      Deny
                    </button>
                  </div>
                </div>
              )}

              {/* Rollback Button */}
              {incident.status === 'cured' && (
                <button
                  onClick={handleRollback}
                  className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs rounded-lg transition"
                >
                  Rollback Action
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">No active incident</p>
              <p className="text-xs mt-1">Trigger a scenario to begin</p>
            </div>
          )}

          {/* Telemetry Charts */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">CPU Load (%)</span>
                <span className={`font-mono ${running ? 'text-rose-500 font-bold' : 'text-slate-600'}`}>
                  {currentCpu.toFixed(1)}%
                </span>
              </div>
              <div className="h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetry} margin={{ top: 2, right: 0, left: -40, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={running ? '#fb7185' : '#60a5fa'} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={running ? '#fb7185' : '#60a5fa'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke={running ? '#fb7185' : '#93c5fd'}
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#cpuGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Network (Mb/s)</span>
                <span className={`font-mono ${running ? 'text-rose-500 font-bold' : 'text-slate-600'}`}>
                  {currentNet.toFixed(0)} Mb/s
                </span>
              </div>
              <div className="h-16 bg-slate-50 rounded-lg overflow-hidden border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetry} margin={{ top: 2, right: 0, left: -40, bottom: 0 }}>
                    <defs>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={running ? '#fb7185' : '#a78bfa'} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={running ? '#fb7185' : '#a78bfa'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="network"
                      stroke={running ? '#fb7185' : '#c4b5fd'}
                      strokeWidth={1.5}
                      fillOpacity={1}
                      fill="url(#netGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
