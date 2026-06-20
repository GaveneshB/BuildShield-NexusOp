import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

// Minimal required icons for the expanded clock
const IconClock = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const IconDatabase = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" /></svg>
);
const IconTerminal = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);

const MOCK_WORKLOADS = [
  { id: 'i-09f2b3491 (Web Server)', service: 'EC2', region: 'us-east-1', cpu: 8, emissions: 45, cost: 2.4 },
  { id: 'db-clust-77 (Database)', service: 'RDS', region: 'eu-west-1', cpu: 65, emissions: 12, cost: 4.8 },
  { id: 'lambda-worker-auth', service: 'Lambda', region: 'ap-southeast-1', cpu: 2, emissions: 5, cost: 0.2 },
  { id: 'i-0ab44f992 (Staging API)', service: 'EC2', region: 'us-east-1', cpu: 4, emissions: 38, cost: 1.8 }
];

export default function ExpandedDebtClockPage({
  carbonDebt = 2068.487,
  financialDebt = 7097.65,
  userCarbonRate = 0.5,
  setUserCarbonRate = () => {},
  userFinRate = 2.1,
  setUserFinRate = () => {},
  currentCarbonRate = 0.5,
  currentFinRate = 2.1,
  lightsOut = false,
}) {
  const [workloads, setWorkloads] = useState(MOCK_WORKLOADS);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalSavedCarbon, setTotalSavedCarbon] = useState(0);
  const [totalSavedCost, setTotalSavedCost] = useState(0);

  // Generate forecasting data
  const projectionData = useMemo(() => {
    const data = [];
    const baseCarbon = carbonDebt;
    for (let hour = 0; hour <= 24; hour += 4) {
      const rateBAU = userCarbonRate;
      const rateLightsOut = userCarbonRate * (lightsOut ? 0.3 : 1.0);
      const rateOpt = userCarbonRate * 0.01;
      
      data.push({
        name: `+${hour}h`,
        BAU: Math.round(baseCarbon + rateBAU * hour * 3600),
        'Shift Control': Math.round(baseCarbon + rateLightsOut * hour * 3600),
        'AI Optimized': Math.round(baseCarbon + rateOpt * hour * 3600),
      });
    }
    return data;
  }, [carbonDebt, userCarbonRate, lightsOut]);

  const handleAnalyze = (workload) => {
    setLoading(true);
    // Simulate AI API delay
    setTimeout(() => {
      let aiResponse;
      if (workload.cpu < 15) {
        aiResponse = {
          status: "Warning",
          action_type: "Downsize or Shutdown",
          reason: `CPU utilization is extremely low at ${workload.cpu}%. Operating in ${workload.region} produces high thermal footprint relative to utilization.`,
          recommendation: `Downgrade ${workload.id} to micro instance or schedule immediate shutdown.`,
          estimated_reduction_gCO2e: workload.emissions * 10,
          estimated_savings_myr: workload.cost * 8,
        };
      } else {
        aiResponse = {
          status: "Healthy",
          action_type: "None",
          reason: `Resource is efficiently utilized at ${workload.cpu}% capacity.`,
          recommendation: "Maintain current state. No phantom drain detected.",
          estimated_reduction_gCO2e: 0,
          estimated_savings_myr: 0,
        };
      }
      setAiAnalysis({ ...aiResponse, targetId: workload.id });
      setLoading(false);
    }, 1200);
  };

  const handleApproveAction = () => {
    if (!aiAnalysis) return;
    setTotalSavedCarbon(prev => prev + aiAnalysis.estimated_reduction_gCO2e);
    setTotalSavedCost(prev => prev + aiAnalysis.estimated_savings_myr);
    setWorkloads(workloads.filter(w => w.id !== aiAnalysis.targetId));
    setAiAnalysis(null);
  };

  return (
    <div className="space-y-8 animate-fade-in text-slate-900 dark:text-blue pb-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tight">⏱️ Expanded Carbon & Security Debt Clock</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-3xl">
          Complete orchestrator view. Calculates ongoing environmental emissions and financial overhead, tracks active infrastructure payloads, and deploys AI logic to terminate phantom workloads.
        </p>
      </div>

      {/* TOP ROW: Giant Live Debt Displays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl border border-red-500/30 bg-[#131b2e] shadow-lg relative overflow-hidden flex flex-col justify-between h-64">
          <div className="space-y-1 z-10">
            <span className="text-xs font-extrabold text-red-500 uppercase tracking-wider block flex items-center gap-2">
              <IconClock className="w-4 h-4" /> Carbon Accumulator
            </span>
            <h3 className="text-sm text-slate-400">Dynamic CO2 release estimation from active cloud servers</h3>
          </div>
          <div className="z-10 mt-4">
            <p className="text-6xl font-mono font-bold text-red-500 tracking-tight" style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
              {carbonDebt.toFixed(3)}
            </p>
            <span className="text-sm text-slate-400">kg CO₂ emissions in progress</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400 border-t border-slate-800 pt-4 mt-4 z-10">
            <span>Base Rate: {userCarbonRate.toFixed(2)}/s</span>
            <span className="font-bold text-red-500">Current Adjusted: {currentCarbonRate.toFixed(3)}/s</span>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-5">
            <IconClock className="w-64 h-64 text-red-500" />
          </div>
        </div>

        <div className="p-8 rounded-2xl border border-amber-500/30 bg-[#131b2e] shadow-lg relative overflow-hidden flex flex-col justify-between h-64">
          <div className="space-y-1 z-10">
            <span className="text-xs font-extrabold text-amber-500 uppercase tracking-wider block flex items-center gap-2">
              <IconDatabase className="w-4 h-4" /> Financial Waste Clock
            </span>
            <h3 className="text-sm text-slate-400">Unoptimized storage cost and idle compute drain</h3>
          </div>
          <div className="z-10 mt-4">
            <p className="text-6xl font-mono font-bold text-amber-500 tracking-tight" style={{ textShadow: '0 0 20px rgba(245,158,11,0.5)' }}>
              RM {financialDebt.toFixed(2)}
            </p>
            <span className="text-sm text-slate-400">MYR accumulated losses</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400 border-t border-slate-800 pt-4 mt-4 z-10">
            <span>Base Rate: RM{userFinRate.toFixed(2)}/s</span>
            <span className="font-bold text-amber-500">Current Adjusted: RM{currentFinRate.toFixed(3)}/s</span>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-5">
            <IconDatabase className="w-64 h-64 text-amber-500" />
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: AI Orchestrator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Live Infrastructure */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-[#131b2e] shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Live Infrastructure Payloads</h3>
            <span className="px-3 py-1 bg-blue-900/40 text-blue-400 text-xs font-bold rounded-full border border-blue-800">
              {workloads.length} Active Nodes
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-500">
                  <th className="py-3 px-4">Resource Node</th>
                  <th className="py-3 px-4">Cloud Region</th>
                  <th className="py-3 px-4">CPU Load</th>
                  <th className="py-3 px-4">Est. Waste</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {workloads.map((w, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-200 text-sm">{w.id}</p>
                      <span className="text-xs text-slate-500">{w.service}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-300">{w.region}</td>
                    <td className="py-4 px-4">
                      <span className={`font-mono text-sm font-bold ${w.cpu < 15 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {w.cpu}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-amber-400 font-mono">RM {w.cost}/hr</td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => handleAnalyze(w)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors border border-slate-600"
                      >
                        Run AI Diagnosis
                      </button>
                    </td>
                  </tr>
                ))}
                {workloads.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-emerald-500 text-sm font-bold">
                      All workloads optimized. No phantom leaks detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: AI Output Engine */}
        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-700 bg-[#0f1523] shadow-lg relative flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <IconTerminal className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">AI Remediation Engine</h3>
          </div>

          <div className="flex-grow flex flex-col justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="text-xs text-slate-400 animate-pulse">Running architectural analysis...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-5 animate-slide-in">
                <div className={`p-4 rounded-xl border ${aiAnalysis.status === 'Warning' ? 'bg-red-900/20 border-red-800/50' : 'bg-emerald-900/20 border-emerald-800/50'}`}>
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Diagnosis ({aiAnalysis.targetId})</p>
                  <p className="text-sm text-slate-200">{aiAnalysis.reason}</p>
                </div>
                
                <div className="p-4 bg-indigo-900/20 border border-indigo-800/50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">AI Recommendation</p>
                  <p className="text-sm text-indigo-200 font-semibold">{aiAnalysis.recommendation}</p>
                </div>

                {aiAnalysis.status === 'Warning' && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs mb-3 text-emerald-400 font-mono font-bold">
                      <span>Savable: {aiAnalysis.estimated_reduction_gCO2e} gCO₂e</span>
                      <span>RM {aiAnalysis.estimated_savings_myr}</span>
                    </div>
                    <button 
                      onClick={handleApproveAction}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20"
                    >
                      Approve & Execute Action
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <p className="text-sm">Select a workload from the active payload table to generate an AI cost & carbon saving strategy.</p>
              </div>
            )}
          </div>

          {/* Gamification Stats */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Total CO₂ Saved</p>
              <p className="text-xl font-bold text-emerald-400">{totalSavedCarbon} <span className="text-xs">g</span></p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Capital Reclaimed</p>
              <p className="text-xl font-bold text-amber-400"><span className="text-xs">RM</span> {totalSavedCost}</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Rate Calibrators & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-800 bg-[#131b2e] shadow-lg space-y-8">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Telemetry Calibration</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-300">Base Carbon Accumulation</label>
              <span className="font-mono text-sm font-semibold text-red-400">{userCarbonRate.toFixed(2)} kg/s</span>
            </div>
            <input
              type="range" min="0.1" max="5.0" step="0.05"
              value={userCarbonRate}
              onChange={(e) => setUserCarbonRate(Number(e.target.value))}
              className="w-full accent-red-500"
            />
            <p className="text-xs text-slate-500">Adjusts for average jobsite load size.</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-300">Base Cost Waste Rate</label>
              <span className="font-mono text-sm font-semibold text-amber-400">RM {userFinRate.toFixed(2)} /s</span>
            </div>
            <input
              type="range" min="0.5" max="10.0" step="0.1"
              value={userFinRate}
              onChange={(e) => setUserFinRate(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <p className="text-xs text-slate-500">On-demand pricing fluctuation simulator.</p>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800 bg-[#131b2e] shadow-lg space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">24-Hour Predictive Forecasting</h3>
            <p className="text-xs text-slate-500">Calculated comparison of projected emissions under different intervention schedules.</p>
          </div>

          <div className="h-64 w-full bg-[#0d121f] p-4 rounded-xl border border-slate-800/80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBAU" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorControl" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="BAU" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorBAU)" />
                <Area type="monotone" dataKey="Shift Control" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorControl)" />
                <Area type="monotone" dataKey="AI Optimized" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOpt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}