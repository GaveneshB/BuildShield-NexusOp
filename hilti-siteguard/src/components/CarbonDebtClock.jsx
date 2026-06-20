import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

/* -------------------------------------------------------------
 * ICONS (Matched to new Light Theme style)
 * ------------------------------------------------------------- */
const IconLeaf = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16c1.5 0 3-1.5 4-3 1-1.5 2-3 4-3s3 1.5 4 3c1.5 1.5 3 3 4 3m-4-3v6m-8-6v6M4 21h16" /></svg>
);
const IconShield = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
);
const IconActivity = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const IconCheck = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
);

/* -------------------------------------------------------------
 * INITIAL MOCK DATA
 * ------------------------------------------------------------- */
const INITIAL_INSIGHTS = [
  {
    id: 'ins-01',
    resource: 'db-instance-01 (US-East)',
    issue: 'High Carbon & Low Use: Server idling at 5% CPU on a coal-heavy grid.',
    recommendation: 'Migrate snapshot to eu-west-1 (Green Grid) or downsize instance.',
    savingsStr: '12.4 kgCO₂e / month',
    savingsNum: 12.4,
    type: 'carbon',
    btnText: 'Execute Migration'
  },
  {
    id: 'ins-02',
    resource: 'dev-api-web',
    issue: 'Security Risk: Open port 22 exposed to the public internet.',
    recommendation: 'Apply restricted Security Group rules via AWS Boto3 API.',
    savingsStr: 'Eliminates critical vulnerability',
    savingsNum: 0,
    type: 'security',
    btnText: 'Fix Security'
  }
];

const INITIAL_AUDIT_LOG = [
  { id: 'log-1', time: '2026-06-20 17:30', event: 'Scheduled Cron: Nightly Dev Shutdown', resource: 'dev-api-web', trigger: 'System (Auto)', impact: 'Saved 1.2 kgCO₂e', status: 'Completed', color: 'teal' },
  { id: 'log-2', time: '2026-06-20 15:15', event: 'Security Patch Deployment', resource: 'prod-load-balancer', trigger: 'Manual (Mikael)', impact: '0.0 kgCO₂e', status: 'Completed', color: 'slate' },
  { id: 'log-3', time: '2026-06-20 09:10', event: 'Grid Carbon Intensity Spike Alert', resource: 'us-east-1 Region', trigger: 'System (Alert)', impact: 'Increased Emission', status: 'Logged', color: 'rose' }
];

const GENERATE_BASE_GRAPH = () => {
  const data = [];
  let baseEmission = 45.0;
  for (let i = 0; i < 24; i++) {
    // Add slight random fluctuation to baseline
    const fluctuation = (Math.random() - 0.5) * 2; 
    data.push({
      hour: `${String(i).padStart(2, '0')}:00`,
      emissions: Number((baseEmission + fluctuation).toFixed(1)),
      eventMarker: 0 // Used for bar chart overlay
    });
  }
  return data;
};

/* -------------------------------------------------------------
 * MAIN COMPONENT
 * ------------------------------------------------------------- */
export default function CarbonDebtClock() {
  // Live Metrics State
  const [totalCarbonFootprint, setTotalCarbonFootprint] = useState(1450.5);
  const [accumulatedCarbonSaved, setAccumulatedCarbonSaved] = useState(342.8);
  const [activeVulnerabilities, setActiveVulnerabilities] = useState(3);
  const [pue, setPue] = useState(1.42);

  // Data States
  const [insights, setInsights] = useState(INITIAL_INSIGHTS);
  const [auditLog, setAuditLog] = useState(INITIAL_AUDIT_LOG);
  const [graphData, setGraphData] = useState(GENERATE_BASE_GRAPH());
  const [processingId, setProcessingId] = useState(null);

  // Current simulated hour (for graph plotting)
  const currentHourIndex = 12; // e.g., 12:00 PM

  // Action Handler: Executes AI recommendation
  const handleExecuteAction = (insight) => {
    setProcessingId(insight.id);

    // Simulate API delay
    setTimeout(() => {
      // 1. Update Top Metrics
      if (insight.type === 'carbon') {
        setTotalCarbonFootprint(prev => prev - insight.savingsNum);
        setAccumulatedCarbonSaved(prev => prev + insight.savingsNum);
        setPue(prev => Number((prev - 0.05).toFixed(2))); // Improve PUE slightly
      } else if (insight.type === 'security') {
        setActiveVulnerabilities(prev => Math.max(0, prev - 1));
      }

      // 2. Remove from Insights Panel
      setInsights(prev => prev.filter(i => i.id !== insight.id));

      // 3. Add to Audit Log
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      
      const newLog = {
        id: `log-${Date.now()}`,
        time: timeStr,
        event: insight.type === 'carbon' ? 'AI Rightsizing & Migration Executed' : 'Automated Security Rule Applied',
        resource: insight.resource,
        trigger: 'Manual (Dashboard UI)',
        impact: insight.type === 'carbon' ? `Saved ${insight.savingsNum} kgCO₂e` : 'Vulnerability Patched',
        status: 'Completed',
        color: insight.type === 'carbon' ? 'teal' : 'indigo'
      };
      
      setAuditLog(prev => [newLog, ...prev]);

      // 4. Update Graph Data accurately (bend the line down from current hour onwards)
      if (insight.type === 'carbon') {
        setGraphData(prev => {
          const newData = [...prev];
          // Drop all future emissions by the savings amount
          for (let i = currentHourIndex; i < newData.length; i++) {
            newData[i].emissions = Number(Math.max(0, newData[i].emissions - insight.savingsNum).toFixed(1));
          }
          // Record the event spike for the bar chart
          newData[currentHourIndex].eventMarker = insight.savingsNum;
          return newData;
        });
      }

      setProcessingId(null);
    }, 1500); // 1.5s delay to simulate cloud API call
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-700">🌍 Carbon & Security Orchestrator</h2>
        <p className="text-slate-500 text-sm max-w-3xl">
          Real-time API-driven telemetry. Monitor infrastructure health, execute automated cloud emission reductions, and track complete security audit trails seamlessly.
        </p>
      </div>

      {/* =========================================
          SECTION A: LIVE IMPACT METRICS (TOP BANNER)
          ========================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="p-6 rounded-2xl border border-rose-200 bg-white/80 backdrop-blur-md shadow-sm shadow-rose-100/50 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Carbon Footprint</span>
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-500"><IconLeaf className="w-4 h-4" /></div>
          </div>
          <p className="text-4xl font-mono font-bold text-rose-500 transition-all duration-700">{totalCarbonFootprint.toFixed(1)}</p>
          <span className="text-xs text-slate-400 mt-1">Live MTCO₂e Output</span>
        </div>

        {/* Metric 2 */}
        <div className="p-6 rounded-2xl border border-teal-200 bg-white/80 backdrop-blur-md shadow-sm shadow-teal-100/50 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Accumulated Carbon Saved</span>
            <div className="p-1.5 bg-teal-100 rounded-lg text-teal-600"><IconActivity className="w-4 h-4" /></div>
          </div>
          <p className="text-4xl font-mono font-bold text-teal-500 transition-all duration-700">{accumulatedCarbonSaved.toFixed(1)}</p>
          <span className="text-xs text-slate-400 mt-1">kgCO₂e Prevented System-wide</span>
        </div>

        {/* Metric 3 */}
        <div className="p-6 rounded-2xl border border-indigo-200 bg-white/80 backdrop-blur-md shadow-sm shadow-indigo-100/50 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Active Vulnerabilities</span>
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-500"><IconShield className="w-4 h-4" /></div>
          </div>
          <p className="text-4xl font-mono font-bold text-indigo-500 transition-all duration-700">{activeVulnerabilities}</p>
          <span className="text-xs text-slate-400 mt-1">Critical/High Security Risks</span>
        </div>

        {/* Metric 4 */}
        <div className="p-6 rounded-2xl border border-sky-200 bg-white/80 backdrop-blur-md shadow-sm shadow-sky-100/50 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Real-time Datacenter PUE</span>
            <div className="p-1.5 bg-sky-100 rounded-lg text-sky-500"><IconActivity className="w-4 h-4" /></div>
          </div>
          <p className="text-4xl font-mono font-bold text-sky-500 transition-all duration-700">{pue.toFixed(2)}</p>
          <span className="text-xs text-slate-400 mt-1">Power Usage Effectiveness (Ideal ~1.0)</span>
        </div>
      </div>

      {/* =========================================
          SECTION B: DYNAMIC ANALYTICS (MAIN GRAPH)
          ========================================= */}
      <div className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Emissions vs. Optimization Events</h3>
            <p className="text-xs text-slate-500">Dual-axis tracking of live carbon output trajectory against automated system mitigation events.</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-400"></span> Live Emissions</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-teal-400"></span> Action Markers</span>
          </div>
        </div>

        <div className="h-80 w-full bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={graphData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="hour" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              {/* Left Y Axis for Carbon Line */}
              <YAxis yAxisId="left" stroke="#fb7185" tick={{ fontSize: 11 }} domain={['dataMin - 10', 'dataMax + 10']} />
              {/* Right Y Axis for Bar Marker */}
              <YAxis yAxisId="right" orientation="right" stroke="#2dd4bf" tick={{ fontSize: 11 }} hide />
              
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#334155', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              
              <ReferenceLine yAxisId="left" x={graphData[currentHourIndex].hour} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'CURRENT', fill: '#94a3b8', fontSize: 10 }} />

              <Bar yAxisId="right" dataKey="eventMarker" barSize={20} fill="#2dd4bf" radius={[4, 4, 0, 0]} name="Mitigation Event Savings" />
              <Line yAxisId="left" type="monotone" dataKey="emissions" stroke="#fb7185" strokeWidth={3} dot={{ r: 3, fill: '#fb7185' }} activeDot={{ r: 6 }} name="kgCO₂e Output" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =========================================
          SECTION C: AI-DRIVEN INSIGHTS
          ========================================= */}
      <div className="space-y-4">
        <h3 className="text-lg font-extrabold text-slate-700 tracking-tight">🧠 AI-Driven Insights & Action Center</h3>
        <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                  <th className="py-4 px-6">Target Resource</th>
                  <th className="py-4 px-6">Issue Detected (Why it emits/risks)</th>
                  <th className="py-4 px-6">AI Recommended Action</th>
                  <th className="py-4 px-6">Estimated Savings / Fix</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {insights.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500 text-sm">
                      All workloads optimized. No outstanding AI recommendations.
                    </td>
                  </tr>
                ) : (
                  insights.map(insight => (
                    <tr key={insight.id} className="hover:bg-slate-50/50 text-sm transition-colors group">
                      <td className="py-4 px-6 font-bold text-slate-700">{insight.resource}</td>
                      <td className="py-4 px-6 text-slate-600 max-w-[250px] leading-relaxed">{insight.issue}</td>
                      <td className="py-4 px-6 text-indigo-600 font-medium max-w-[250px]">{insight.recommendation}</td>
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-teal-600">{insight.savingsStr}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleExecuteAction(insight)}
                          disabled={processingId !== null}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 ml-auto w-[160px] ${
                            processingId === insight.id 
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                              : insight.type === 'carbon' 
                                ? 'bg-teal-400 hover:bg-teal-500 text-white shadow-teal-200' 
                                : 'bg-indigo-400 hover:bg-indigo-500 text-white shadow-indigo-200'
                          }`}
                        >
                          {processingId === insight.id ? (
                            <span className="flex items-center gap-2"><div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"/> Executing...</span>
                          ) : (
                            <span className="flex items-center gap-1.5"><IconCheck /> {insight.btnText}</span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================
          SECTION D: PROCESS & ACTION AUDIT LOG
          ========================================= */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-lg font-extrabold text-slate-700 tracking-tight">📋 System Activity & Audit History</h3>
          <span className="text-xs text-slate-500 bg-white/80 px-3 py-1 rounded-full border border-slate-200 shadow-sm">Immutable Infrastructure Log</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-50/50">
                  <th className="py-4 px-6 whitespace-nowrap">Timestamp</th>
                  <th className="py-4 px-6">Event / Process</th>
                  <th className="py-4 px-6">Affected Resource</th>
                  <th className="py-4 px-6">Triggered By</th>
                  <th className="py-4 px-6">Carbon Impact</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 text-sm transition-colors text-slate-600">
                    <td className="py-4 px-6 font-mono text-xs">{log.time}</td>
                    <td className="py-4 px-6 font-semibold text-slate-700">{log.event}</td>
                    <td className="py-4 px-6 font-mono text-xs">{log.resource}</td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[10px] font-bold border border-slate-200">
                        {log.trigger}
                      </span>
                    </td>
                    <td className={`py-4 px-6 font-mono text-xs font-semibold ${
                      log.impact.includes('Saved') ? 'text-teal-600' : log.impact.includes('Increase') ? 'text-rose-500' : 'text-slate-500'
                    }`}>
                      {log.impact}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wide text-slate-700">
                        <span className={`w-2 h-2 rounded-full bg-${log.color}-400`}></span>
                        {log.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}