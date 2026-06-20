import React, { useState, useEffect, useMemo } from 'react';

/* ─────────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────────── */
const IconLeaf = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 008.716-6.747M12 21a9 9 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" />
  </svg>
);
const IconBolt = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
  </svg>
);
const IconPower = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
  </svg>
);
const IconServer = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 17.25v.75a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25v-.75m17.25-10.5v-.75A2.25 2.25 0 0017.25 4.5H4.5a2.25 2.25 0 00-2.25 2.25v.75m0 10.5h19.5M3 9.75h18M7.5 12.75h.008v.008H7.5v-.008zm3.75 0h.008v.008H11.25v-.008zm3.75 0h.008v.008H15v-.008z" />
  </svg>
);
const IconHistory = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconCheck = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const IconChevron = ({ className = 'w-4 h-4', down = true }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d={down ? 'M19 9l-7 7-7-7' : 'M5 15l7-7 7 7'} />
  </svg>
);
const IconWarn = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);
const IconSummary = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);
const IconShield = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.105-2.59-.308-3.837A11.977 11.977 0 0112 2.718z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   MOCK SERVER DATA
   Each server has security health parameters.
───────────────────────────────────────────────────────────── */
const SERVERS_INIT = [
  { id: 'sv-01', name: 'prod-api-01',      region: 'US-East',     cpu: 89, ram: 72, gridIntensity: 415, powerW: 320, type: 'API Server',       status: 'critical', cves: 4, firewall: 'active', securityGrade: 'C' },
  { id: 'sv-02', name: 'prod-api-02',      region: 'US-East',     cpu: 83, ram: 68, gridIntensity: 415, powerW: 310, type: 'API Server',       status: 'critical', cves: 3, firewall: 'active', securityGrade: 'C' },
  { id: 'sv-03', name: 'analytics-wkr-1',  region: 'EU-West',     cpu: 4,  ram: 22, gridIntensity: 185, powerW: 280, type: 'Analytics Worker', status: 'warning',  cves: 0, firewall: 'inactive', securityGrade: 'B'  },
  { id: 'sv-04', name: 'analytics-wkr-2',  region: 'EU-West',     cpu: 3,  ram: 18, gridIntensity: 185, powerW: 275, type: 'Analytics Worker', status: 'warning',  cves: 1, firewall: 'active', securityGrade: 'B'  },
  { id: 'sv-05', name: 'staging-api',       region: 'US-West',     cpu: 6,  ram: 30, gridIntensity: 210, powerW: 200, type: 'Staging Server',   status: 'warning',  cves: 5, firewall: 'inactive', securityGrade: 'D'  },
  { id: 'sv-06', name: 'dev-env-01',        region: 'US-West',     cpu: 2,  ram: 12, gridIntensity: 210, powerW: 180, type: 'Dev Environment',  status: 'warning',  cves: 2, firewall: 'inactive', securityGrade: 'C'  },
  { id: 'sv-07', name: 'primary-db',        region: 'US-East',     cpu: 45, ram: 80, gridIntensity: 415, powerW: 450, type: 'Database',         status: 'warning',  cves: 0, firewall: 'active', securityGrade: 'B'  },
  { id: 'sv-08', name: 'replica-db',        region: 'EU-Central',  cpu: 38, ram: 75, gridIntensity: 120, powerW: 420, type: 'Database',         status: 'ok',       cves: 0, firewall: 'active', securityGrade: 'A'       },
  { id: 'sv-09', name: 'cdn-edge-sg',       region: 'AP-Southeast', cpu: 15, ram: 28, gridIntensity: 440, powerW: 150, type: 'CDN Edge',         status: 'ok',       cves: 0, firewall: 'active', securityGrade: 'A'       },
  { id: 'sv-10', name: 'media-proc-01',     region: 'US-East',     cpu: 77, ram: 88, gridIntensity: 415, powerW: 500, type: 'Media Processor',  status: 'critical', cves: 6, firewall: 'inactive', securityGrade: 'D' },
];

/* ─────────────────────────────────────────────────────────────
   CLIENT-SIDE OPTIMIZATION SUGGESTIONS (LOCAL FALLBACK)
───────────────────────────────────────────────────────────── */
function getAISuggestion(server) {
  if (server.status === 'ok') return null;

  if (server.cves > 0 || server.firewall === 'inactive') {
    let risks = [];
    let recs = [];
    if (server.cves > 0) {
      risks.push(`${server.cves} unpatched vulnerabilities`);
      recs.push(`apply security hotfixes`);
    }
    if (server.firewall === 'inactive') {
      risks.push(`inactive firewall policy`);
      recs.push(`enable firewall security rules`);
    }

    if (server.cpu < 15) {
      risks.push(`severe CPU idle state (${server.cpu}%)`);
      recs.push(`downsize instance size`);
      return {
        action: `Secure and Downsize ${server.name}`,
        why: `Server is exposed via ${risks.join(' & ')} while wasting power in idle state.`,
        recommendation: `${recs.join(', ')} to restore resource utility and patch threat exposures.`,
        carbonSave: parseFloat((server.powerW * 0.4 * server.gridIntensity / 1000000 * 24).toFixed(2)),
        costSave: parseFloat((server.powerW * 0.4 / 1000 * 24 * 0.15).toFixed(2)),
      };
    } else if (server.gridIntensity > 300) {
      risks.push(`hosted in high carbon intensity grid (${server.region})`);
      recs.push(`migrate host to cleaner regional grid`);
      return {
        action: `Patch & Migrate ${server.name}`,
        why: `Server suffers from ${risks.join(' & ')} under heavy carbon energy supply.`,
        recommendation: `${recs.join(', ')} (e.g. EU-West) to minimize regulatory risk and footprint.`,
        carbonSave: parseFloat((server.powerW * (server.gridIntensity - 185) / 1000000 * 24).toFixed(2)),
        costSave: parseFloat((server.powerW / 1000 * 24 * 0.08).toFixed(2)),
      };
    } else {
      return {
        action: `Patch & Harden ${server.name}`,
        why: `Server is exposed with ${risks.join(' & ')}. Security score degraded.`,
        recommendation: `${recs.join(' and ')} immediately.`,
        carbonSave: 1.20,
        costSave: 0.00,
      };
    }
  }

  if (server.cpu < 15 && server.status === 'warning') {
    return {
      action: `Downsize ${server.name}`,
      why: `CPU usage is only ${server.cpu}%. The server is over-provisioned. Full power is drawn even when mostly idle.`,
      recommendation: `Move workload to a smaller instance type or share with another underused server.`,
      carbonSave: parseFloat((server.powerW * 0.4 * server.gridIntensity / 1000000 * 24).toFixed(2)),
      costSave: parseFloat((server.powerW * 0.4 / 1000 * 24 * 0.15).toFixed(2)),
    };
  }
  if (server.cpu > 75 && server.gridIntensity > 300) {
    return {
      action: `Move ${server.name} to cleaner region`,
      why: `Grid intensity is ${server.gridIntensity} gCO₂e/kWh in ${server.region}. This is 3–10× higher than clean-energy regions like EU-West or AP-Hydro.`,
      recommendation: `Migrate workload to a low-carbon region (e.g., EU-West at 185 gCO₂e/kWh or hydro-powered region at ~40 gCO₂e/kWh).`,
      carbonSave: parseFloat((server.powerW * (server.gridIntensity - 185) / 1000000 * 24).toFixed(2)),
      costSave: parseFloat((server.powerW / 1000 * 24 * 0.08).toFixed(2)),
    };
  }
  if (server.type === 'Staging Server' || server.type === 'Dev Environment') {
    return {
      action: `Schedule off-hours shutdown for ${server.name}`,
      why: `Staging and dev servers run 24/7 but are only needed during work hours (~8–10 hrs/day). They waste power at night.`,
      recommendation: `Auto-shutdown from 10 PM to 7 AM daily. This saves ~14 hrs of idle power per day.`,
      carbonSave: parseFloat((server.powerW * 14 * server.gridIntensity / 1000000).toFixed(2)),
      costSave: parseFloat((server.powerW * 14 / 1000 * 0.15).toFixed(2)),
    };
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────
   BACKEND API SUGGESTION CLIENT (GEMINI RUNS ON THE BACKEND)
───────────────────────────────────────────────────────────── */
const fetchBackendSuggestion = async (server) => {
  const response = await fetch('/api/carbon/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ server })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData?.error || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return {
    ...data.suggestion,
    source: data.source // 'gemini' or 'fallback'
  };
};

/* Carbon kg/day for a server */
function calcDailyCarbon(server) {
  return parseFloat((server.powerW * 24 * server.gridIntensity / 1000000).toFixed(3));
}

/* ─────────────────────────────────────────────────────────────
   SEEDED HISTORY
───────────────────────────────────────────────────────────── */
function seedHistory() {
  const now = Date.now();
  return [
    {
      id: 'h-seed-1',
      serverName: 'replica-db',
      action: 'Moved replica-db to EU-Central (low-carbon region)',
      timestamp: new Date(now - 12 * 86400000),
      carbonSaved: 8.64,
      costSaved: 1.51,
    },
    {
      id: 'h-seed-2',
      serverName: 'dev-env-02',
      action: 'Scheduled off-hours shutdown for dev-env-02',
      timestamp: new Date(now - 8 * 86400000),
      carbonSaved: 2.18,
      costSaved: 0.38,
    },
    {
      id: 'h-seed-3',
      serverName: 'analytics-wkr-3',
      action: 'Downsized analytics-wkr-3 to t3.small',
      timestamp: new Date(now - 3 * 86400000),
      carbonSaved: 5.72,
      costSaved: 2.02,
    },
    {
      id: 'h-seed-4',
      serverName: 'staging-api-old',
      action: 'Terminated idle staging-api-old (0% active traffic)',
      timestamp: new Date(now - 1 * 86400000),
      carbonSaved: 3.96,
      costSaved: 0.72,
    },
  ];
}

/* ─────────────────────────────────────────────────────────────
   HELPER: format date label
───────────────────────────────────────────────────────────── */
function fmtDate(d) {
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */
function StatusBadge({ status }) {
  const map = {
    critical: 'bg-rose-50 text-rose-600 border-rose-200',
    warning:  'bg-amber-50 text-amber-600 border-amber-200',
    ok:       'bg-teal-50  text-teal-600  border-teal-200',
  };
  const label = { critical: 'High Load', warning: 'Inefficient', ok: 'Healthy' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${map[status] ?? map.ok}`}>
      {label[status] ?? status}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   SECURITY GRADE BADGE
───────────────────────────────────────────────────────────── */
function SecurityBadge({ grade }) {
  const colors = {
    A: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    B: 'bg-teal-50 text-teal-600 border-teal-200',
    C: 'bg-amber-50 text-amber-600 border-amber-200',
    D: 'bg-orange-50 text-orange-600 border-orange-200',
    F: 'bg-rose-50 text-rose-600 border-rose-200',
  };
  return (
    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black border ${colors[grade] || colors.F}`}>
      {grade}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function CarbonDebtClock({
  totalCarbonSaved = 0,
  totalCapitalSaved = 0,
  addSavedMetrics = () => {},
  triggerToast = () => {},
}) {
  const [tab, setTab] = useState('servers'); // 'servers' | 'history' | 'summary'
  
  // Load servers state from localStorage or fallback
  const [servers, setServers] = useState(() => {
    try {
      const stored = localStorage.getItem('carbon_servers_data');
      if (stored) return JSON.parse(stored);
    } catch {}
    return SERVERS_INIT;
  });

  // States to track AI suggestions fetched live from the backend
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [loadingSuggestions, setLoadingSuggestions] = useState({});
  const [errorSuggestions, setErrorSuggestions] = useState({});

  // Server Sorting
  const [sortField, setSortField] = useState('status'); // 'name' | 'cpu' | 'grid' | 'co2' | 'security' | 'status'
  const [sortDirection, setSortDirection] = useState('desc');

  // History Sorting
  const [historySort, setHistorySort] = useState('newest'); // 'newest' | 'oldest' | 'carbon' | 'cost'

  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('carbon_action_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map(h => ({ ...h, timestamp: new Date(h.timestamp) }));
      }
    } catch {}
    return seedHistory();
  });

  const [processingId, setProcessingId] = useState(null);
  const [expandedServer, setExpandedServer] = useState(null);

  // Summary filters
  const [summaryRange, setSummaryRange] = useState('week'); // 'week' | 'month' | 'custom'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo,   setCustomTo]   = useState('');

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('carbon_action_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  // Persist servers
  useEffect(() => {
    try {
      localStorage.setItem('carbon_servers_data', JSON.stringify(servers));
    } catch {}
  }, [servers]);

  /* ── Derived totals ── */
  const totalDailyCarbon = useMemo(() => servers.reduce((s, sv) => s + calcDailyCarbon(sv), 0), [servers]);
  const totalSavedAll    = useMemo(() => history.reduce((s, h) => s + h.carbonSaved, 0), [history]);
  
  // We sum up the critical and warning servers based on carbon or security threats
  const serversNeedActionCount = useMemo(() => {
    return servers.filter(s => s.status !== 'ok' || s.cves > 0 || s.firewall === 'inactive').length;
  }, [servers]);

  // Live trigger for AI audits contacting backend
  const triggerAIAudit = async (serverId) => {
    const server = servers.find(s => s.id === serverId);
    if (!server) return;

    setLoadingSuggestions(prev => ({ ...prev, [serverId]: true }));
    setErrorSuggestions(prev => ({ ...prev, [serverId]: null }));
    try {
      const result = await fetchBackendSuggestion(server);
      setAiSuggestions(prev => ({ ...prev, [serverId]: result }));
      triggerToast(`✨ AI audit complete for ${server.name}`, 'success');
    } catch (err) {
      console.warn("Backend AI call failed. Falling back to local offline heuristics. Error:", err.message);
      // Fallback immediately to local heuristics so it works seamlessly
      const fallback = getAISuggestion(server);
      if (fallback) {
        setAiSuggestions(prev => ({ ...prev, [serverId]: { ...fallback, source: 'fallback' } }));
        triggerToast(`Offline audit generated for ${server.name}`, 'success');
      } else {
        setErrorSuggestions(prev => ({ ...prev, [serverId]: "Could not generate optimization plan." }));
        triggerToast(`Audit failed: ${err.message}`, 'error');
      }
    } finally {
      setLoadingSuggestions(prev => ({ ...prev, [serverId]: false }));
    }
  };

  const handleExpandServer = async (serverId) => {
    const isExpanding = expandedServer !== serverId;
    setExpandedServer(isExpanding ? serverId : null);

    if (isExpanding) {
      // If we don't have it cached, fetch it automatically
      if (!aiSuggestions[serverId] && !loadingSuggestions[serverId]) {
        const server = servers.find(s => s.id === serverId);
        if (server && server.status !== 'ok') {
          setLoadingSuggestions(prev => ({ ...prev, [serverId]: true }));
          setErrorSuggestions(prev => ({ ...prev, [serverId]: null }));
          try {
            const result = await fetchBackendSuggestion(server);
            setAiSuggestions(prev => ({ ...prev, [serverId]: result }));
          } catch (err) {
            console.warn("Backend AI call failed. Falling back to local offline rules. Error:", err.message);
            // Fallback immediately to local heuristics so it works seamlessly
            const fallback = getAISuggestion(server);
            if (fallback) {
              setAiSuggestions(prev => ({ ...prev, [serverId]: { ...fallback, source: 'fallback' } }));
            } else {
              setErrorSuggestions(prev => ({ ...prev, [serverId]: "Could not generate optimization plan." }));
            }
          } finally {
            setLoadingSuggestions(prev => ({ ...prev, [serverId]: false }));
          }
        }
      }
    }
  };

  /* ── Apply AI action ── */
  const applyAction = (server, suggestion) => {
    setProcessingId(server.id);
    setTimeout(() => {
      const entry = {
        id: `h-${Date.now()}`,
        serverName: server.name,
        action: suggestion.action,
        timestamp: new Date(),
        carbonSaved: suggestion.carbonSave,
        costSaved: suggestion.costSave,
      };
      setHistory(prev => [entry, ...prev]);
      addSavedMetrics(suggestion.carbonSave, suggestion.costSave);

      // Update server status to ok, clear CVEs, activate firewall, set security grade to A
      setServers(prev => prev.map(s => 
        s.id === server.id 
          ? { ...s, status: 'ok', cves: 0, firewall: 'active', securityGrade: 'A' } 
          : s
      ));
      setProcessingId(null);
      setExpandedServer(null);
      triggerToast(`✅ Optimization applied: ${suggestion.action}`, 'success');
    }, 1200);
  };

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      if (['cpu', 'grid', 'co2', 'security', 'status'].includes(field)) {
        setSortDirection('desc'); // Show worst/highest first
      } else {
        setSortDirection('asc');
      }
    }
  };

  // Sort and filter servers
  const sortedServers = useMemo(() => {
    const items = [...servers];
    items.sort((a, b) => {
      let valA, valB;
      switch (sortField) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'cpu':
          valA = a.cpu;
          valB = b.cpu;
          break;
        case 'grid':
          valA = a.gridIntensity;
          valB = b.gridIntensity;
          break;
        case 'co2':
          valA = calcDailyCarbon(a);
          valB = calcDailyCarbon(b);
          break;
        case 'security':
          valA = (a.securityGrade.charCodeAt(0) * 100) + a.cves;
          valB = (b.securityGrade.charCodeAt(0) * 100) + b.cves;
          break;
        case 'status':
          const rank = { critical: 3, warning: 2, ok: 1 };
          valA = rank[a.status] || 0;
          valB = rank[b.status] || 0;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [servers, sortField, sortDirection]);

  /* ── Summary filter ── */
  const filteredHistory = useMemo(() => {
    const now = new Date();
    let from, to;
    if (summaryRange === 'week') {
      from = new Date(now.getTime() - 7 * 86400000);
      to   = now;
    } else if (summaryRange === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to   = now;
    } else {
      from = customFrom ? new Date(customFrom) : new Date(0);
      to   = customTo   ? new Date(customTo)   : now;
    }
    return history.filter(h => h.timestamp >= from && h.timestamp <= to);
  }, [history, summaryRange, customFrom, customTo]);

  // Sort history
  const sortedHistory = useMemo(() => {
    const items = [...filteredHistory];
    items.sort((a, b) => {
      let valA, valB;
      switch (historySort) {
        case 'newest':
          valA = a.timestamp.getTime();
          valB = b.timestamp.getTime();
          return valB - valA;
        case 'oldest':
          valA = a.timestamp.getTime();
          valB = b.timestamp.getTime();
          return valA - valB;
        case 'carbon':
          valA = a.carbonSaved;
          valB = b.carbonSaved;
          return valB - valA;
        case 'cost':
          valA = a.costSaved;
          valB = b.costSaved;
          return valB - valA;
        default:
          return 0;
      }
    });
    return items;
  }, [filteredHistory, historySort]);

  const summaryCarbon = filteredHistory.reduce((s, h) => s + h.carbonSaved, 0);
  const summaryCost   = filteredHistory.reduce((s, h) => s + h.costSaved,   0);

  /* ─────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-700">
            Carbon Operations
          </h2>
          <p className="text-slate-400 text-sm">
            Monitor server emissions · Audit security compliance · Orchestrate green savings
          </p>
        </div>

        {/* Summary KPI strip */}
        <div className="flex flex-wrap gap-3">
          <KpiChip label="Total CO₂ Today" value={`${totalDailyCarbon.toFixed(1)} kg`} color="rose" />
          <KpiChip label="Total Saved" value={`${(totalCarbonSaved + totalSavedAll).toFixed(1)} kg`} color="teal" />
          <KpiChip label="Servers Need Action" value={`${serversNeedActionCount}`} color="amber" />
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'servers',  label: 'Servers',        },
          { id: 'history',  label: 'Action History',  },
          { id: 'summary',  label: 'Summary',         },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px ${
              tab === t.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          TAB: SERVERS
      ═══════════════════════════════════════════ */}
      {tab === 'servers' && (
        <div className="space-y-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header Columns - Desktop Only */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <button onClick={() => handleSort('name')} className="col-span-3 flex items-center gap-1 hover:text-indigo-600 transition-colors focus:outline-none text-left cursor-pointer">
                Server {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('cpu')} className="col-span-2 flex items-center gap-1 hover:text-indigo-600 transition-colors focus:outline-none text-left cursor-pointer">
                CPU & RAM {sortField === 'cpu' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('grid')} className="col-span-2 flex items-center gap-1 hover:text-indigo-600 transition-colors focus:outline-none text-left cursor-pointer">
                Grid Intensity {sortField === 'grid' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('co2')} className="col-span-2 flex items-center gap-1 hover:text-indigo-600 transition-colors focus:outline-none text-left font-mono cursor-pointer">
                Daily CO₂ {sortField === 'co2' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('security')} className="col-span-2 flex items-center gap-1 hover:text-indigo-600 transition-colors focus:outline-none text-left cursor-pointer">
                Security Health {sortField === 'security' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button onClick={() => handleSort('status')} className="col-span-1 flex items-center justify-end gap-1 hover:text-indigo-600 transition-colors focus:outline-none pr-4 cursor-pointer">
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
            </div>

            {/* List Rows */}
            <div className="divide-y divide-slate-100">
              {sortedServers.map(server => {
                const suggestion = getAISuggestion(server);
                const dailyCarbon = calcDailyCarbon(server);
                const isExpanded = expandedServer === server.id;

                return (
                  <div
                    key={server.id}
                    className={`transition-all ${
                      isExpanded ? 'bg-indigo-50/10' : 'hover:bg-slate-50/40'
                    }`}
                  >
                    {/* Desktop/Tablet aligned layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center px-6 py-4">
                      {/* Server name */}
                      <div className="col-span-3 flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          server.status === 'critical' ? 'bg-rose-50 text-rose-500 border border-rose-100'
                          : server.status === 'warning' ? 'bg-amber-50 text-amber-500 border border-amber-100'
                          : 'bg-teal-50 text-teal-500 border border-teal-100'
                        }`}>
                          <IconServer className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-700 text-sm truncate">{server.name}</p>
                          <p className="text-xs text-slate-400">{server.type} · {server.region}</p>
                        </div>
                      </div>

                      {/* CPU / RAM usage */}
                      <div className="col-span-2 min-w-0">
                        <CpuBar cpu={server.cpu} ram={server.ram} />
                      </div>

                      {/* Grid intensity */}
                      <div className="col-span-2">
                        <p className="font-semibold text-slate-700 text-sm">
                          {server.gridIntensity} <span className="text-[10px] text-slate-400 font-normal">gCO₂/kWh</span>
                        </p>
                        <p className="text-[10px] text-slate-400">PUE 1.15 baseline</p>
                      </div>

                      {/* Daily Carbon Output */}
                      <div className="col-span-2 font-mono">
                        <p className="font-bold text-slate-700 text-sm">
                          {dailyCarbon.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">kg/day</span>
                        </p>
                        <p className="text-[10px] text-slate-400">{server.powerW}W draw</p>
                      </div>

                      {/* Security Parameters */}
                      <div className="col-span-2 flex items-center gap-2">
                        <SecurityBadge grade={server.securityGrade} />
                        <div className="text-[10px] leading-tight">
                          <p className={`font-bold ${server.cves > 0 ? 'text-rose-500 font-extrabold' : 'text-slate-500'}`}>
                            {server.cves > 0 ? `${server.cves} CVEs` : 'Secure'}
                          </p>
                          <p className="text-slate-400">{server.firewall === 'active' ? 'Firewall Protected' : 'No Firewall'}</p>
                        </div>
                      </div>

                      {/* Status and Action expansion toggle */}
                      <div className="col-span-1 flex items-center justify-end gap-2 pr-2">
                        <StatusBadge status={server.status} />
                        <button
                          onClick={() => handleExpandServer(server.id)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isExpanded
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-500'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                          title="Audit & Suggest Actions"
                        >
                          <IconChevron className="w-3.5 h-3.5" down={!isExpanded} />
                        </button>
                      </div>
                    </div>

                    {/* Mobile responsive layout */}
                    <div className="md:hidden p-4 space-y-3 border-b border-slate-100">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-700 text-sm">{server.name}</span>
                            <StatusBadge status={server.status} />
                          </div>
                          <p className="text-xs text-slate-400">{server.type} · {server.region}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <SecurityBadge grade={server.securityGrade} />
                          <button
                            onClick={() => handleExpandServer(server.id)}
                            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            AI Fix <IconChevron className="w-3 h-3" down={!isExpanded} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">CPU / RAM</p>
                          <p className="font-semibold text-slate-600 mt-0.5">CPU {server.cpu}% · RAM {server.ram}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Emissions</p>
                          <p className="font-semibold text-slate-600 mt-0.5">{dailyCarbon.toFixed(1)} kg/day</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">CVE / FW</p>
                          <p className="font-semibold text-slate-600 mt-0.5">{server.cves} CVEs · {server.firewall === 'active' ? 'FW On' : 'FW Off'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Suggestion Panel (Gemini AI Audit or Local fallback) */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-5 space-y-4">
                        {loadingSuggestions[server.id] ? (
                          <div className="py-8 text-center space-y-3">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-600 animate-pulse">Running AI Security & Carbon Audit...</p>
                              <p className="text-[10px] text-slate-400 font-medium">Running advanced diagnostic audits on server telemetry...</p>
                            </div>
                          </div>
                        ) : errorSuggestions[server.id] ? (
                          <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                              <IconWarn className="w-4 h-4" />
                              <span>AI Audit Failed</span>
                            </div>
                            <p className="text-xs text-rose-500 font-mono leading-relaxed">{errorSuggestions[server.id]}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => triggerAIAudit(server.id)}
                                className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors font-bold text-xs cursor-pointer"
                              >
                                Retry AI Audit
                              </button>
                            </div>
                          </div>
                        ) : (() => {
                          const activeSuggestion = aiSuggestions[server.id] || suggestion;
                          const isLiveAI = activeSuggestion && activeSuggestion.source === 'gemini';

                          if (!activeSuggestion) {
                            return (
                              <div className="text-center py-4 text-xs text-slate-400 font-semibold">
                                No optimization required. This server is in perfect health, security posture, and energy efficiency.
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wide px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-600">
                                  {isLiveAI ? 'AI-Generated Optimization' : 'Standard Optimization Recommendation'}
                                </span>
                                <button
                                  onClick={() => triggerAIAudit(server.id)}
                                  className="text-xs font-bold text-indigo-500 hover:text-indigo-600 hover:underline cursor-pointer"
                                >
                                  Re-run Audit
                                </button>
                              </div>

                              {/* Why it flags */}
                              <div className="bg-slate-100 border border-slate-200/60 rounded-xl p-4 space-y-1">
                                <div className="flex items-center gap-1.5 text-slate-600 font-bold text-xs uppercase tracking-wide">
                                  <IconWarn className="w-3.5 h-3.5 text-amber-500" />
                                  Why this workload is flagging
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed font-medium">{activeSuggestion.why}</p>
                              </div>

                              {/* Recommendation */}
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Optimization Mitigation</p>
                                <p className="text-sm text-slate-700 leading-relaxed font-bold">{activeSuggestion.recommendation}</p>
                              </div>

                              {/* Savings estimate */}
                              <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-xl px-4 py-2.5">
                                  <IconLeaf className="w-4 h-4 text-teal-500" />
                                  <div>
                                    <p className="text-xs font-bold text-teal-600">−{activeSuggestion.carbonSave.toFixed(2)} kg CO₂/day</p>
                                    <p className="text-[9px] text-slate-400">Carbon Prevented</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5">
                                  <span className="text-indigo-500 font-bold text-xs">RM</span>
                                  <div>
                                    <p className="text-xs font-bold text-indigo-600">Save RM {activeSuggestion.costSave.toFixed(2)}/day</p>
                                    <p className="text-[9px] text-slate-400">Cost Savings</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                                  <IconShield className="w-4 h-4 text-emerald-500" />
                                  <div>
                                    <p className="text-xs font-bold text-emerald-600">Grade {server.securityGrade} → A</p>
                                    <p className="text-[9px] text-slate-400">Security Target</p>
                                  </div>
                                </div>
                              </div>

                              {/* Apply button */}
                              <button
                                onClick={() => applyAction(server, activeSuggestion)}
                                disabled={processingId === server.id}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2 ${
                                  processingId === server.id
                                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                    : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm active:scale-[0.98] cursor-pointer'
                                }`}
                              >
                                {processingId === server.id ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                    <span>Applying orchestration policies…</span>
                                  </>
                                ) : (
                                  `Apply AI Suggestion: ${activeSuggestion.action}`
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          TAB: ACTION HISTORY
      ═══════════════════════════════════════════ */}
      {tab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <IconHistory className="w-5 h-5 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-700">Orchestration Audit Log</h3>
                <p className="text-[11px] text-slate-400">{history.length} operations completed</p>
              </div>
            </div>
            
            {/* Sorting control */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sort History:</span>
              <select
                value={historySort}
                onChange={(e) => setHistorySort(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-slate-600"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="carbon">CO₂ Saved (High to Low)</option>
                <option value="cost">Cost Saved (High to Low)</option>
              </select>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="bg-white/80 rounded-2xl border border-slate-200 p-10 text-center">
              <p className="text-slate-400 text-sm">No actions have been applied yet.</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {sortedHistory.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-teal-50 border border-teal-200 text-teal-500 flex items-center justify-center shrink-0">
                      <IconCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-700 truncate">{item.action}</p>
                      <p className="text-xs text-slate-400">{fmtDate(item.timestamp)} · {item.serverName}</p>
                    </div>
                    <div className="flex gap-2 shrink-0 text-xs font-bold font-mono">
                      <span className="text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-lg">
                        −{item.carbonSaved.toFixed(2)} kg CO₂
                      </span>
                      <span className="text-indigo-500 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                        RM {item.costSaved.toFixed(2)} saved
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer totals */}
              <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex flex-wrap gap-4 text-xs font-bold text-slate-500">
                <span>Total Carbon Prevented: <span className="text-teal-600">{totalSavedAll.toFixed(2)} kg CO₂</span></span>
                <span>Total Cost Saved: <span className="text-indigo-500">RM {history.reduce((s, h) => s + h.costSaved, 0).toFixed(2)}</span></span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════
          TAB: SUMMARY
      ═══════════════════════════════════════════ */}
      {tab === 'summary' && (
        <div className="space-y-6">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide font-medium">Show:</p>
            {['week', 'month', 'custom'].map(r => (
              <button
                key={r}
                onClick={() => setSummaryRange(r)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  summaryRange === r
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white/80 text-slate-500 border-slate-200 hover:border-indigo-200'
                }`}
              >
                {r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : 'Custom Range'}
              </button>
            ))}
            {summaryRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 bg-white/80"
                />
                <span className="text-slate-400 text-xs font-bold">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 bg-white/80"
                />
              </div>
            )}
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SummaryKpi
              icon={<IconLeaf className="w-5 h-5" />}
              label="Carbon Prevented"
              value={`${summaryCarbon.toFixed(2)} kg CO₂`}
              sub={`${filteredHistory.length} actions`}
              color="teal"
            />
            <SummaryKpi
              icon={<IconSummary className="w-5 h-5" />}
              label="Cost Saved"
              value={`RM ${summaryCost.toFixed(2)}`}
              sub="estimated savings"
              color="indigo"
            />
            <SummaryKpi
              icon={<IconServer className="w-5 h-5" />}
              label="Daily Emission Now"
              value={`${totalDailyCarbon.toFixed(1)} kg/day`}
              sub={`${servers.length} servers running`}
              color="rose"
            />
          </div>

          {/* Actions in period */}
          {filteredHistory.length === 0 ? (
            <div className="bg-white/80 rounded-2xl border border-slate-200 p-10 text-center">
              <p className="text-slate-400 text-sm">No actions in this period.</p>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide">
                Actions in period
              </div>
              <div className="divide-y divide-slate-100">
                {filteredHistory.map(item => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-700 truncate">{item.action}</p>
                      <p className="text-xs text-slate-400">{fmtDate(item.timestamp)}</p>
                    </div>
                    <div className="flex gap-3 shrink-0 text-xs font-bold">
                      <span className="text-teal-600">−{item.carbonSaved.toFixed(2)} kg CO₂</span>
                      <span className="text-indigo-500">RM {item.costSaved.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All-time totals */}
          <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-2xl p-5 flex flex-wrap gap-5 items-center shadow-sm">
            <IconLeaf className="w-8 h-8 text-teal-400 shrink-0" />
            <div>
              <p className="text-xs text-teal-500 font-bold uppercase tracking-wide">All-Time Total Carbon Saved</p>
              <p className="text-2xl font-extrabold text-teal-600 font-mono">{(totalCarbonSaved + totalSavedAll).toFixed(2)} kg CO₂e</p>
              <p className="text-xs text-slate-400 mt-0.5">From {history.length} completed actions</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */
function KpiChip({ label, value, color }) {
  const colors = {
    rose:  'bg-rose-50  border-rose-200  text-rose-600',
    teal:  'bg-teal-50  border-teal-200  text-teal-600',
    amber: 'bg-amber-50 border-amber-200 text-amber-600',
  };
  return (
    <div className={`px-3 py-2 rounded-xl border text-xs ${colors[color]}`}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mb-0.5">{label}</p>
      <p className="font-extrabold text-sm font-mono">{value}</p>
    </div>
  );
}

function CpuBar({ cpu, ram }) {
  const color = cpu > 75 ? '#fb7185' : cpu > 30 ? '#fbbf24' : '#34d399';
  return (
    <div className="space-y-1">
      <div>
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
          <span>CPU {cpu}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-0.5">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${cpu}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-[9px] text-slate-400 leading-none">
        <span>RAM {ram}%</span>
      </div>
    </div>
  );
}

function SummaryKpi({ icon, label, value, sub, color }) {
  const colors = {
    teal:  'bg-teal-100  text-teal-500',
    indigo:'bg-indigo-100 text-indigo-500',
    rose:  'bg-rose-100  text-rose-500',
  };
  const vals = {
    teal:  'text-teal-600',
    indigo:'text-indigo-600',
    rose:  'text-rose-600',
  };
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className={`text-xl font-extrabold font-mono ${vals[color]}`}>{value}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}