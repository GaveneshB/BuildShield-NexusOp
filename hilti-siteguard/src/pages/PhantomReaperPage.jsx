import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit, increment, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.config';

const STATUS_COLOR = {
  active: { dot: '#10b981', label: 'ACTIVE' },
  under_attack: { dot: '#ef4444', label: 'UNDER ATTACK' },
  idle: { dot: '#f59e0b', label: 'IDLE' },
  reaped: { dot: 'rgba(255,255,255,0.2)', label: 'TERMINATED' },
};

const THREAT_TAGS = [
  "Critical: Unpatched CVE-2023-4863",
  "Warning: Open Port 22 (0.0.0.0/0)",
  "Threat: Suspicious Outbound Traffic",
  "Risk: Hardcoded Root Credentials",
  "Critical: Exposed Storage Bucket",
  "Threat: Idle Compute Memory Leak",
  "Warning: Expired TLS Certificate"
];

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);

  useEffect(() => {
    let startValue = displayRef.current;
    let endValue = value;
    let startTime;
    let animationFrame;

    if (startValue === endValue) {
      setDisplay(endValue);
      return;
    }

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * ease;

      setDisplay(current);
      displayRef.current = current;

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setDisplay(endValue);
        displayRef.current = endValue;
      }
    };
    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{prefix}{Math.round(display).toLocaleString()}{suffix}</>;
}

export default function PhantomReaperPage() {
  const [projects, setProjects] = useState([]);
  const [resources, setResources] = useState([]);
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState({ totalResourcesReaped: 0, totalEnergySavedKwh: 0, totalCostSavedUSD: 0, totalCarbonSavedKg: 0 });

  const [loading, setLoading] = useState(false);
  const [activeProj, setActiveProj] = useState(null);

  // Threat Sweep State
  const [countdown, setCountdown] = useState(null);
  const [pendingProjectId, setPendingProjectId] = useState(null);
  const [scanThreats, setScanThreats] = useState({});
  const logEndRef = useRef(null);
  const countdownRef = useRef(null);

  useEffect(() => { fetchAll(); }, []);

  // Only auto-scroll the terminal div internally — never the whole page
  const terminalRef = useRef(null);
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [events]);

  async function fetchAll() {
    try {
      const pSnap = await getDocs(query(collection(db, 'projects'), orderBy('updatedAt', 'desc')));
      const pData = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const rSnap = await getDocs(query(collection(db, 'cloudResources'), orderBy('createdAt', 'desc')));
      const rData = rSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const eSnap = await getDocs(query(collection(db, 'reapEvents'), orderBy('initiatedAt', 'desc'), limit(50)));
      const eData = eSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const sSnap = await getDoc(doc(db, 'reapSummary', 'global'));
      if (sSnap.exists()) {
        setSummary(sSnap.data());
      }
      setProjects(pData);
      setResources(rData);
      setEvents(eData);
    } catch (err) {
      console.error("Error fetching phantom reaper data", err);
    }
  }

  const addInstantLog = (msg, isScan = false, type = 'info') => {
    setEvents(prev => [{
      id: Math.random().toString(),
      isSystemLog: true,
      message: msg,
      isScan,
      type,
      completedAt: { toDate: () => new Date() }
    }, ...prev].slice(0, 50));
  };

  // 1. Start the countdown and visual scanning phase
  const initiateSweep = (projectId) => {
    if (countdown !== null) return; // Prevent multiple
    setActiveProj(projectId);
    setPendingProjectId(projectId);
    setCountdown(5); // 5 second countdown
    addInstantLog(`[THREAT SWEEP] Initiating pre-termination vulnerability scan for Project: ${projectId}...`, true, 'warning');

    // Assign random threats to resources for visual storytelling
    const projRes = resources.filter(r => r.projectId === projectId && r.status !== 'reaped');

    const assignedThreats = {};
    projRes.forEach(r => {
      assignedThreats[r.id] = THREAT_TAGS[Math.floor(Math.random() * THREAT_TAGS.length)];
      if (r.status === 'under_attack') {
        assignedThreats[r.id] = 'CRITICAL: Zero-Day Cryptominer Actively Executing';
      }
    });
    setScanThreats(assignedThreats);

    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          executeReap(projectId);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 2. Cancel the sweep
  const cancelSweep = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
    setPendingProjectId(null);
    setScanThreats({});
    addInstantLog(`[ABORT] Operator manually aborted the termination sweep. Resources left active.`, false, 'error');
  };

  // 3. The actual termination execution
  async function executeReap(projectId) {
    setPendingProjectId(null);
    setScanThreats({});
    addInstantLog(`[EXECUTE] Countdown complete. Initiating hostile termination sequence...`, true, 'success');

    const resourcesSnap = await getDocs(query(collection(db, 'cloudResources'), where('projectId', '==', projectId), where('status', 'in', ['active', 'idle', 'under_attack'])));

    if (resourcesSnap.empty) {
      addInstantLog(`[AUTO-REAPER] Scan clear. 0 unsecured resources found.`, false, 'info');

      // Update project to complete anyway
      await updateDoc(doc(db, 'projects', projectId), {
        status: 'completed', completedAt: new Date(), updatedAt: new Date()
      });
      await fetchAll();
      return;
    }

    const batch = writeBatch(db);
    const newEvents = [];
    let localSavingsCost = 0;
    let localSavingsEnergy = 0;
    let localSavingsCarbon = 0;

    for (const d of resourcesSnap.docs) {
      const res = d.data();
      const energySaved = +(res.energyKwhPerDay * 30).toFixed(2);
      const carbonSaved = +(energySaved * 0.417).toFixed(2);
      const costSaved = +(res.monthlyCostMYR ?? res.monthlyCostUSD ?? 0).toFixed(2);

      localSavingsCost += costSaved;
      localSavingsEnergy += energySaved;
      localSavingsCarbon += carbonSaved;

      const eventRef = doc(collection(db, 'reapEvents'));
      newEvents.push({ energySaved, carbonSaved, costSaved });

      batch.set(eventRef, {
        projectId, resourceId: d.id,
        resourceName: res.name, resourceTag: res.resourceTag,
        action: 'sigkill', trigger: 'auto_reap',
        status: 'success',
        energySavedKwh: energySaved, costSavedMYR: costSaved, carbonSavedKg: carbonSaved,
        errorMessage: null, initiatedAt: new Date(), completedAt: new Date()
      });

      batch.update(d.ref, {
        status: 'reaped', reapedAt: new Date(), reapedBy: 'auto'
      });
    }

    batch.update(doc(db, 'projects', projectId), {
      status: 'completed', completedAt: new Date(), updatedAt: new Date()
    });

    const summaryRef = doc(db, 'reapSummary', 'global');
    batch.update(summaryRef, {
      totalResourcesReaped: increment(newEvents.length),
      totalEnergySavedKwh: increment(localSavingsEnergy),
      totalCostSavedUSD: increment(localSavingsCost),
      totalCarbonSavedKg: increment(localSavingsCarbon),
      lastUpdated: new Date()
    });

    await batch.commit();

    // Optimistically update summary so slot machine runs immediately
    setSummary(prev => ({
      ...prev,
      totalResourcesReaped: (prev.totalResourcesReaped || 0) + newEvents.length,
      totalEnergySavedKwh: (prev.totalEnergySavedKwh || 0) + localSavingsEnergy,
      totalCostSavedUSD: (prev.totalCostSavedUSD || 0) + localSavingsCost,
      totalCarbonSavedKg: (prev.totalCarbonSavedKg || 0) + localSavingsCarbon
    }));

    await fetchAll();
  }

  // Live Threat Injection (Demo Centerpiece)
  async function injectExploit(projectId) {
    setLoading(true);
    setActiveProj(projectId);
    addInstantLog(`[THREAT INJECTED] Simulating zero-day cryptojacking attack on Project: ${projectId}...`, false, 'error');

    try {
      const resourcesSnap = await getDocs(query(collection(db, 'cloudResources'), where('projectId', '==', projectId)));
      const batch = writeBatch(db);

      for (const d of resourcesSnap.docs) {
        batch.update(d.ref, {
          status: 'under_attack',
          reapedAt: null,
          reapedBy: null,
          lastActiveAt: new Date()
        });
      }

      batch.update(doc(db, 'projects', projectId), {
        status: 'active',
        completedAt: null,
        updatedAt: new Date()
      });

      await batch.commit();
      addInstantLog(`[ALERT] CPU workloads spiked to 99%. Massive outbound data transfer detected. Systems severely compromised.`, false, 'error');
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const projResources = activeProj ? resources.filter(r => r.projectId === activeProj) : [];

  return (
    <div className="space-y-6 animate-fade-in bg-slate-50 min-h-full rounded-2xl pb-8 relative overflow-hidden">

      {/* Background Pulse if countdown active */}
      {countdown !== null && (
        <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none z-0"></div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-white backdrop-blur-md p-6 lg:p-8 border-b border-slate-200 shadow-sm relative z-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-rose-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="relative z-10 flex-1 pr-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Live Threat Sweep <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-600">& Auto-Reaper</span>
            </h1>
          </div>
          <p className="text-sm text-slate-600 max-w-4xl leading-relaxed font-medium">
            When a project finishes, its cloud servers become dark infrastructure—prime targets for hijacking.
            Marking a project Complete initiates an active vulnerability scan and gives you a 5-second window to abort before forcefully severing all exposed nodes.
          </p>
        </div>
        <button onClick={fetchAll} className="mt-4 md:mt-0 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg shadow-sm hover:bg-slate-50 hover:shadow transition-all flex items-center gap-2 text-sm shrink-0">
          ↻ Refresh Nodes
        </button>
      </div>

      <div className="px-6 lg:px-8 space-y-6 relative z-10">

        {/* Global Impact Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Card 1 */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-bl-full -mr-6 -mt-6 pointer-events-none"></div>
            <div className="p-5 relative z-10 flex flex-col gap-1">
              <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest">Nodes Shut Down</p>
              <p className="text-4xl font-black font-mono text-indigo-600 leading-none">
                <AnimatedCounter value={summary.totalResourcesReaped ?? 0} />
              </p>
              <p className="text-xs text-slate-400 mt-1">Orphaned cloud instances terminated by the Reaper</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-sky-50 rounded-bl-full -mr-6 -mt-6 pointer-events-none"></div>
            <div className="p-5 relative z-10 flex flex-col gap-1">
              <p className="text-[11px] text-sky-400 font-bold uppercase tracking-widest">Amount saved</p>
              <p className="text-4xl font-black font-mono text-sky-600 leading-none">
                <AnimatedCounter value={summary.totalCostSavedMYR ?? 0} prefix="RM" duration={1800} />
              </p>
              <p className="text-xs text-rose-500 font-semibold mt-1">
                Cost if left unchecked:
                <span className="font-black ml-1">
                  RM<AnimatedCounter value={(summary.totalCostSavedMYR ?? 0) * 12} duration={2000} />/year
                </span>
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-full -mr-6 -mt-6 pointer-events-none"></div>
            <div className="p-5 relative z-10 flex flex-col gap-1">
              <p className="text-[11px] text-emerald-500 font-bold uppercase tracking-widest">Energy Saved</p>
              <p className="text-4xl font-black font-mono text-emerald-600 leading-none">
                <AnimatedCounter value={summary.totalEnergySavedKwh ?? 0} duration={1800} />
                <span className="text-2xl font-bold"> kWh</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">Equivalent electricity to power ~<AnimatedCounter value={Math.round((summary.totalEnergySavedKwh ?? 0) / 30)} duration={2000} /> homes for a month</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="relative overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-50 rounded-bl-full -mr-6 -mt-6 pointer-events-none"></div>
            <div className="p-5 relative z-10 flex flex-col gap-1">
              <p className="text-[11px] text-purple-400 font-bold uppercase tracking-widest">CO₂ Eliminated</p>
              <p className="text-4xl font-black font-mono text-purple-600 leading-none">
                <AnimatedCounter value={summary.totalCarbonSavedKg ?? 0} duration={1800} />
                <span className="text-2xl font-bold"> kg</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1 italic">0.417 kg CO₂/kWh · EPA eGRID national average</p>
            </div>
          </div>

        </div>

        <div className="grid gap-6 lg:grid-cols-12">

          {/* Projects Command Center */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="text-sm font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center text-xs">1</span>
                Project Portfolios
              </div>
            </div>

            <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar bg-slate-50/30">
              {projects.map(proj => {
                const isActive = proj.status === 'active';
                const isPendingReap = pendingProjectId === proj.id;

                return (
                  <div key={proj.id}
                    onClick={() => setActiveProj(proj.id)}
                    className={`p-5 rounded-xl cursor-pointer transition-all border-2 relative overflow-hidden ${isPendingReap ? 'bg-rose-50 border-rose-400 shadow-lg scale-[1.02] z-20' :
                      activeProj === proj.id ? 'bg-white border-indigo-400 shadow-md transform scale-[1.02] z-10' :
                        'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                      }`}>

                    {isPendingReap && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-rose-200">
                        <div className="h-full bg-rose-600 transition-all duration-1000 ease-linear" style={{ width: `${(countdown / 5) * 100}%` }}></div>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="pr-2">
                        <div className="text-base font-extrabold text-slate-900">{proj.name}</div>
                        <div className="text-xs mt-1 text-slate-500 font-medium flex items-center gap-2">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{proj.hiltiProjectId}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest border ${proj.status === 'completed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          proj.status === 'archived' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                          {proj.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 gap-2">
                      {isPendingReap ? (
                        <div className="flex items-center justify-between bg-rose-600 p-1.5 pl-4 rounded-lg shadow-inner">
                          <span className="text-white font-bold text-sm flex items-center gap-2 animate-pulse">
                            TERMINATING IN {countdown}...
                          </span>
                          <button onClick={(e) => { e.stopPropagation(); cancelSweep(); }}
                            className="px-4 py-2 bg-white text-rose-700 hover:bg-slate-100 text-xs rounded-md font-bold transition-colors">
                            ABORT
                          </button>
                        </div>
                      ) : isActive ? (
                        <button
                          onClick={e => { e.stopPropagation(); initiateSweep(proj.id); }}
                          disabled={countdown !== null}
                          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded-lg font-bold shadow-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50 active:scale-95">
                          ✓ Mark Complete & Sweep
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={e => { e.stopPropagation(); initiateSweep(proj.id); }}
                            disabled={countdown !== null}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-[10px] sm:text-xs rounded-lg font-bold shadow-sm transition-all flex justify-center items-center gap-1 active:scale-95 disabled:opacity-50">
                            Force Deep Scan
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); injectExploit(proj.id); }}
                            disabled={countdown !== null || loading}
                            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white text-[10px] sm:text-xs rounded-lg font-extrabold shadow-sm shadow-rose-500/30 transition-all flex justify-center items-center gap-1 active:scale-95 disabled:opacity-50 group">
                            <span className="group-hover:scale-110 transition-transform">☣️</span> Inject Exploit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Topology View */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden h-[600px] relative">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center z-20">
              <div className="text-sm font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center text-xs">2</span>
                Cloud Node Topology
              </div>
              {countdown !== null && (
                <span className="flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 animate-pulse">
                  <div className="w-3 h-3 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                  Security Scan Active
                </span>
              )}
            </div>

            {projResources.length === 0
              ? <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-slate-50/30">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                  <span className="text-3xl opacity-50">☁️</span>
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">No Project Selected</h3>
                <p className="text-sm text-slate-500 max-w-sm">Select a project to inspect its active nodes and vulnerability status.</p>
              </div>
              : <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 relative">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <div className="space-y-4 relative z-10">
                  {projResources.map(res => {
                    const isReaped = res.status === 'reaped';
                    const isUnderAttack = res.status === 'under_attack';
                    const isScanning = countdown !== null && activeProj === pendingProjectId && !isReaped;
                    const threatTag = scanThreats[res.id];

                    return (
                      <div key={res.id} className={`p-5 rounded-xl border-2 transition-all relative overflow-hidden bg-white shadow-sm ${isUnderAttack ? 'border-rose-500 bg-rose-50/50 animate-pulse' :
                        isReaped ? 'border-slate-200 opacity-70' :
                          isScanning ? 'border-amber-300' : 'border-indigo-100 hover:shadow-md'
                        }`}>

                        {isUnderAttack && (
                          <div className="absolute top-0 right-0 px-3 py-1 bg-rose-600 text-white text-[10px] font-black tracking-widest rounded-bl-lg">COMPROMISED</div>
                        )}

                        <div className="flex items-start justify-between relative z-10">
                          <div className="flex gap-4">
                            <div className={`mt-1 w-12 h-12 rounded-lg flex items-center justify-center shadow-inner ${isUnderAttack ? 'bg-rose-200 text-rose-700 border-2 border-rose-500' :
                              isReaped ? 'bg-slate-100 text-slate-400 border border-slate-200' :
                                'bg-indigo-100 text-indigo-600 border border-indigo-200'
                              }`}>
                              <span className="text-2xl font-black">{res.resourceType === 'database' || res.resourceType === 'rds' ? '🗄️' : '🖥️'}</span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-base font-bold ${isReaped ? 'text-slate-500 line-through' : isUnderAttack ? 'text-rose-700' : 'text-slate-900'}`}>{res.name}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-wider ${isUnderAttack ? 'bg-rose-200 text-rose-800' : 'bg-slate-200 text-slate-600'}`}>
                                  {res.resourceType.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 font-medium">
                                {res.provider.toUpperCase()} · {res.region} · <span className="font-mono">{res.resourceTag}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Live Security Scan / Threat Injector View */}
                        {isScanning && threatTag && (
                          <div className="mt-4 pt-3 border-t border-amber-200">
                            <div className="text-xs font-mono font-bold text-amber-600 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                              VULNERABILITY DETECTED: <span className="text-rose-600">{threatTag}</span>
                            </div>
                          </div>
                        )}

                        {isUnderAttack && !isScanning && (
                          <div className="mt-4 pt-3 border-t border-rose-200">
                            <div className="text-xs font-mono font-bold text-rose-600 flex flex-col gap-1">
                              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> CPU Spiked to 99%</span>
                              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Runaway Cryptominer Process Executing</span>
                            </div>
                          </div>
                        )}

                        <div className={`mt-4 pt-4 border-t flex items-center gap-8 relative z-10 ${isReaped ? 'border-slate-100' : 'border-indigo-50'}`}>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Kos Bulanan</p>
                            <span className={`text-sm font-black ${isReaped ? 'text-slate-400' : 'text-sky-600'}`}>RM {(res.monthlyCostMYR ?? res.monthlyCostUSD ?? 0).toFixed(2)}</span>
                          </div>
                          {!isReaped && (
                            <div>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Kos Bocor 1 Tahun</p>
                              <span className="text-sm font-black text-rose-500">RM {((res.monthlyCostMYR ?? res.monthlyCostUSD ?? 0) * 12).toLocaleString()}</span>
                            </div>
                          )}
                          {isReaped && res.reapedAt && (
                            <div className="ml-auto text-right">
                              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-0.5 flex items-center justify-end gap-1"><span className="text-lg leading-none">✓</span> Securely Terminated</p>
                              <span className="text-xs font-medium text-slate-400">{res.reapedAt?.toDate?.().toLocaleString() || new Date().toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            }
          </div>
        </div>

        {/* Interactive Threat Terminal */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              </div>
              <span className="w-2 h-2 rounded-full bg-indigo-500 active-pulse ml-2"></span>
              Live Threat Terminal
            </div>
            <div className="text-[10px] text-slate-500 font-mono">STATUS: {countdown !== null ? 'EXECUTING SWEEP' : 'LISTENING'}</div>
          </div>

          <div ref={terminalRef} className="p-5 h-[250px] overflow-y-auto custom-scrollbar font-mono text-sm space-y-1">
            {events.length === 0 ? (
              <div className="text-slate-600 pt-2 flex items-center gap-2">
                <span className="animate-pulse">_</span> Awaiting execution triggers...
              </div>
            ) : events.map((evt, idx) => {

              if (evt.isSystemLog) {
                const color = evt.type === 'error' ? 'text-rose-400' : evt.type === 'warning' ? 'text-amber-400' : evt.type === 'success' ? 'text-emerald-400' : 'text-sky-400';
                return (
                  <div key={evt.id || idx} className={`py-1 flex gap-3 ${color}`}>
                    <span className="opacity-40 text-[10px] mt-1 shrink-0">{evt.completedAt?.toDate?.().toLocaleTimeString() || new Date().toLocaleTimeString()}</span>
                    <span>{evt.message}</span>
                  </div>
                );
              }

              return (
                <div key={evt.id} className="py-2 border-b border-slate-800/50 flex flex-col md:flex-row md:items-start gap-3 hover:bg-slate-800/30 transition-colors px-2 rounded">
                  <div className="text-[10px] text-slate-500 shrink-0 w-20 pt-1">
                    {evt.completedAt?.toDate?.().toLocaleTimeString() || new Date().toLocaleTimeString()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-200">
                      <span className={evt.status === 'success' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        [{evt.status.toUpperCase()}]
                      </span>{' '}
                      Terminated <span className="text-indigo-300 font-semibold">{evt.resourceName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Action: {evt.action} · Trigger: auto_reap
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 flex gap-4 text-xs mt-1 md:mt-0 bg-slate-900 p-2 rounded">
                    <span className="text-emerald-400 font-bold tracking-wide">-{evt.energySavedKwh} kWh</span>
                    <span className="text-sky-400 font-bold tracking-wide">-RM {typeof (evt.costSavedMYR ?? evt.costSavedUSD) === 'number' ? (evt.costSavedMYR ?? evt.costSavedUSD).toFixed(2) : '0.00'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
