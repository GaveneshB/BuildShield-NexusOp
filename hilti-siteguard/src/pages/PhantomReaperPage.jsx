import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where, orderBy, limit, increment, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.config';

const STATUS_COLOR = {
  active:       { dot:'#00ff9d', label:'ACTIVE' },
  idle:         { dot:'#ffaa00', label:'IDLE' },
  pending_reap: { dot:'#a855f7', label:'PENDING REAP' },
  reaped:       { dot:'rgba(255,255,255,0.2)', label:'REAPED' },
};

export default function PhantomReaperPage() {
  const [projects,   setProjects]   = useState([]);
  const [resources,  setResources]  = useState([]);
  const [events,     setEvents]     = useState([]);
  const [summary,    setSummary]    = useState({});
  const [loading,    setLoading]    = useState(false);
  const [activeProj, setActiveProj] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      // Fetch projects
      const pSnap = await getDocs(query(collection(db, 'projects'), orderBy('updatedAt', 'desc')));
      const pData = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch resources
      const rSnap = await getDocs(query(collection(db, 'cloudResources'), orderBy('createdAt', 'desc')));
      const rData = rSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch events
      const eSnap = await getDocs(query(collection(db, 'reapEvents'), orderBy('initiatedAt', 'desc'), limit(50)));
      const eData = eSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Fetch summary
      const sSnap = await getDoc(doc(db, 'reapSummary', 'global'));
      const sData = sSnap.exists() ? sSnap.data() : { totalResourcesReaped:0, totalEnergySavedKwh:0, totalCostSavedUSD:0, totalCarbonSavedKg:0 };

      setProjects(pData);
      setResources(rData);
      setEvents(eData);
      setSummary(sData);
    } catch (err) {
      console.error("Error fetching phantom reaper data", err);
    }
  }

  // Simulated Reaper Logic (Frontend execution for demo without needing a backend server)
  async function executeReap(projectId, triggerName) {
    const resourcesSnap = await getDocs(query(collection(db, 'cloudResources'), where('projectId', '==', projectId), where('status', 'in', ['active', 'idle'])));
    
    if (resourcesSnap.empty) return;

    const batch = writeBatch(db);
    const newEvents = [];
    
    for (const d of resourcesSnap.docs) {
      const res = d.data();
      const energySaved = +(res.energyKwhPerDay * 30).toFixed(2);
      const carbonSaved = +(energySaved * 0.417).toFixed(2);
      const costSaved   = +(res.monthlyCostUSD).toFixed(2);

      // Create reap event
      const eventRef = doc(collection(db, 'reapEvents'));
      newEvents.push({ energySaved, carbonSaved, costSaved });

      batch.set(eventRef, {
        projectId, resourceId: d.id,
        resourceName: res.name, resourceTag: res.resourceTag,
        action: 'shutdown', trigger: triggerName,
        status: 'success',
        energySavedKwh: energySaved, costSavedUSD: costSaved, carbonSavedKg: carbonSaved,
        errorMessage: null,
        initiatedAt: new Date(),
        completedAt: new Date()
      });

      // Update resource status
      batch.update(d.ref, {
        status: 'reaped',
        reapedAt: new Date(),
        reapedBy: 'auto'
      });
    }

    // Update global summary
    const summaryRef = doc(db, 'reapSummary', 'global');
    batch.update(summaryRef, {
      totalResourcesReaped: increment(newEvents.length),
      totalEnergySavedKwh:  increment(newEvents.reduce((a,e)=>a+e.energySaved,0)),
      totalCostSavedUSD:    increment(newEvents.reduce((a,e)=>a+e.costSaved,0)),
      totalCarbonSavedKg:   increment(newEvents.reduce((a,e)=>a+e.carbonSaved,0)),
      lastUpdated: new Date()
    });

    await batch.commit();
  }

  async function markComplete(projectId) {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      });
      await executeReap(projectId, 'project_completed');
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function manualReap(projectId) {
    setLoading(true);
    try {
      await executeReap(projectId, 'manual');
      await fetchAll();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  const projResources = activeProj
    ? resources.filter(r => r.projectId === activeProj)
    : [];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between bg-white/60 backdrop-blur-md p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Phantom Infrastructure Auto-Reaper
          </h1>
          <p className="text-sm mt-2 text-slate-600 max-w-2xl leading-relaxed">
            <strong>What does this do?</strong> When a physical construction project is finished, developers often forget to turn off the expensive cloud databases and virtual servers (EC2, Azure VMs, etc) linked to that project. 
            <br/><br/>
            This Auto-Reaper acts as a bridge. Click <strong>"Mark Complete"</strong> on an active project below to watch it automatically sweep through the cloud and forcefully terminate all orphaned virtual servers, calculating the exact amount of money and carbon emissions saved.
          </p>
        </div>
        <button onClick={fetchAll} className="px-4 py-2 bg-slate-900 text-white font-bold rounded shadow hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm shrink-0">
          ↻ Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label:'Resources Reaped',  value: summary.totalResourcesReaped ?? 0,     color:'text-rose-600' },
          { label:'Energy Saved (kWh)',value: Math.round(summary.totalEnergySavedKwh ?? 0).toLocaleString(),     color:'text-emerald-600' },
          { label:'Cost Saved (USD)',  value:`$${Math.round(summary.totalCostSavedUSD ?? 0).toLocaleString()}`,   color:'text-sky-600' },
          { label:'Carbon Saved (kg)', value: Math.round(summary.totalCarbonSavedKg ?? 0).toLocaleString(),     color:'text-purple-600' },
        ].map(m => (
          <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="text-xs mb-1 text-slate-500 font-bold uppercase tracking-wider">{m.label}</div>
            <div className={`text-3xl font-black font-mono tracking-tight ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Projects */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full">
          <div className="text-xs font-bold mb-4 text-slate-500 uppercase tracking-wider">
            1. Select a Hilti Project
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto">
            {projects.map(proj => (
              <div key={proj.id}
                onClick={() => setActiveProj(proj.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  activeProj === proj.id 
                    ? 'bg-sky-50 border-sky-400 shadow-md transform scale-[1.01]' 
                    : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                }`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-base font-bold text-slate-900">{proj.name}</div>
                    <div className="text-xs mt-1 text-slate-500 font-medium">
                      {proj.hiltiProjectId} · <span className="text-sky-600 font-bold">{resources.filter(r=>r.projectId===proj.id).length} cloud resources linked</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest border ${
                      proj.status === 'completed' ? 'bg-rose-100 text-rose-700 border-rose-200' :
                      proj.status === 'archived'  ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                      'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}>
                      {proj.status.toUpperCase()}
                    </span>
                    {proj.status === 'active' && (
                      <button
                        onClick={e => { e.stopPropagation(); markComplete(proj.id); }}
                        disabled={loading}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs rounded font-bold shadow-md transition-colors w-full">
                        Mark Complete
                      </button>
                    )}
                    {(proj.status==='completed'||proj.status==='archived') && (
                      <button
                        onClick={e => { e.stopPropagation(); manualReap(proj.id); }}
                        disabled={loading}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs rounded font-bold shadow-md transition-colors w-full opacity-70">
                        Force Auto-Reap
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resources for selected project */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full">
          <div className="text-xs font-bold mb-4 text-slate-500 uppercase tracking-wider">
            2. Associated Cloud Resources
          </div>
          {projResources.length === 0
            ? <div className="text-sm text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                {activeProj ? 'No cloud infrastructure linked to this project.' : 'Click a project on the left to inspect its active cloud resources.'}
              </div>
            : <div className="space-y-3 overflow-y-auto">
                {projResources.map(res => {
                  const sc = STATUS_COLOR[res.status] || STATUS_COLOR.active;
                  return (
                    <div key={res.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm relative overflow-hidden">
                      {res.status === 'reaped' && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-rose-500/20 transform -rotate-12 border-4 border-rose-500/20 px-4 py-1 rounded-xl">TERMINATED</span>
                      </div>}
                      <div className="flex items-start justify-between relative z-0">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{res.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold tracking-wider">
                              {res.resourceType.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 font-medium">
                            {res.provider.toUpperCase()} · {res.region} · <span className="font-mono text-[10px]">{res.resourceTag}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-mono font-black px-2 py-1 rounded bg-white shadow-sm" style={{ color:sc.dot }}>{sc.label}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 mt-4 relative z-0 bg-white p-2 rounded-lg border border-slate-100">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Energy Cost</p>
                          <span className="text-sm font-black text-emerald-600">{res.energyKwhPerDay} kWh/d</span>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Financial Cost</p>
                          <span className="text-sm font-black text-sky-600">${res.monthlyCostUSD.toFixed(2)}/mo</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </div>

      {/* Reap Event Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl text-slate-300 font-mono">
        <div className="text-xs font-bold mb-4 text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 active-pulse"></span>
          Live Termination Log
        </div>
        <div className="space-y-2 h-64 overflow-y-auto pr-2 custom-scrollbar">
          {events.length === 0 ? (
            <div className="text-sm py-4 text-slate-600 text-center">Waiting for auto-reap events...</div>
          ) : events.map(evt => (
            <div key={evt.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-3 border-l-2 border-slate-700 bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <div className="text-[10px] text-slate-500 shrink-0 w-32">
                {evt.completedAt?.toDate?.().toLocaleString() || new Date().toLocaleString()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span className={evt.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                    [{evt.status.toUpperCase()}]
                  </span>
                  {evt.resourceName}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Trigger: <span className="text-slate-300">{evt.trigger}</span> | Action: <span className="text-rose-400 font-bold">{evt.action}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 bg-slate-950 p-2 rounded border border-slate-800">
                <div className="text-xs font-bold text-emerald-400">
                  -{evt.energySavedKwh} kWh
                </div>
                <div className="text-xs font-bold text-sky-400 mt-0.5">
                  -${evt.costSavedUSD.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
