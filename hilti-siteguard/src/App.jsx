import { useState, useEffect, useRef, useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  AreaChart,
  Area
} from 'recharts'

import CarbonDebtClock from './components/CarbonDebtClock'

/* -------------------------------------------------------------
 * FIREBASE INITIALIZATION & DB LAYER
 * ------------------------------------------------------------- */
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db, rtdb, isFirebaseReady } from './firebase.config.js'
import PhantomReaperPageNew from './pages/PhantomReaperPage.jsx'

const APP_ID = 'buildshield-nexusop'

/* -------------------------------------------------------------
 * HIGH-QUALITY INLINE SVG ICONS
 * ------------------------------------------------------------- */
const IconHome = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const IconClock = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const IconCalendar = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const IconUsers = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const IconGhost = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a5 5 0 00-5 5v8.32a3 3 0 00.78 2.02l2.36 2.52a1 1 0 001.44 0l2.36-2.52a3 3 0 00.78-2.02V7a5 5 0 00-5-5z M9 10h.01M15 10h.01" />
  </svg>
)

const IconTerminal = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const IconDatabase = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.58 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.58 4 8 4s8-1.79 8-4M4 7c0-2.21 3.58-4 8-4s8 1.79 8 4m0 5c0 2.21-3.58 4-8 4s-8-1.79-8-4" />
  </svg>
)

const IconShield = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const IconSun = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
)

const IconMoon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

const IconSearch = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const IconCheck = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const IconChevronRight = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

const IconClose = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const IconMenu = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const IconAlert = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
)

const IconRefresh = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
  </svg>
)

/* -------------------------------------------------------------
 * MAIN APP COMPONENT
 * ------------------------------------------------------------- */
export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  
  // Database Connection Status
  const [dbStatus] = useState(isFirebaseReady ? 'connected' : 'local')

  // Global System States
  const [lightsOut, setLightsOut] = useState(() => {
    try {
      const localVal = localStorage.getItem('lightsOutActive')
      return localVal ? JSON.parse(localVal) : false
    } catch {
      return false
    }
  })
  const [shiftStart, setShiftStart] = useState(() => {
    const val = localStorage.getItem('shiftStart')
    return val ? Number(val) : 7
  })
  const [shiftEnd, setShiftEnd] = useState(() => {
    const val = localStorage.getItem('shiftEnd')
    return val ? Number(val) : 17
  })
  const [cureResolved, setCureResolved] = useState(() => {
    try {
      const localVal = localStorage.getItem('cureResolved')
      return localVal ? JSON.parse(localVal) : true
    } catch {
      return true
    }
  })

  // Toast notifications state
  const [toasts, setToasts] = useState([])
  const triggerToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }

  // Handle Theme Toggle
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Subcontractor State
  const [subs, setSubs] = useState(() => {
    try {
      const saved = localStorage.getItem('subs_list')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) {
      console.warn(e)
    }
    return [
      { id: 1, name: 'Apex Plumbing', phase: 'Active', downloads: 24, hours: 2.4, accessStatus: 'Granted' },
      { id: 2, name: 'Bright Electric', phase: 'Active', downloads: 120, hours: 12.1, accessStatus: 'Granted' },
      { id: 3, name: 'Eagle HVAC', phase: 'Completed', downloads: 3, hours: 0.2, accessStatus: 'Revoked' }
    ]
  })

  // Helper score calculator
  const getScore = (d, h) => Math.round((0.6 * Math.max(0, 1 - d / 200) + 0.4 * Math.max(0, 1 - h / 50)) * 100)

  // Sync subcontractor changes
  const saveSubs = (updatedSubs) => {
    setSubs(updatedSubs)
    localStorage.setItem('subs_list', JSON.stringify(updatedSubs))
    
    if (isFirebaseReady && db) {
      try {
        setDoc(doc(db, `artifacts/${APP_ID}/subcontractors/list`), { data: updatedSubs }, { merge: true })
          .catch(e => console.error("Firebase save subs error:", e))
      } catch (e) {
        console.warn("Firestore sync failed:", e)
      }
    }
  }

  // Reaper projects state
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('reaper_projects')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch (e) {
      console.warn(e)
    }
    return [
      {
        id: 'p1',
        name: 'Riverside Tower Phase 1',
        resources: ['1x RDS Database', '2x EC2', '1x Lambda'],
        cost: 245.50,
        co2: 18.7,
        reaped: false
      },
      {
        id: 'p2',
        name: 'Harbor Offices Renovation',
        resources: ['1x DynamoDB', '3x ECS Tasks'],
        cost: 156.20,
        co2: 11.2,
        reaped: false
      }
    ]
  })

  const saveProjects = (updatedProjects) => {
    setProjects(updatedProjects)
    localStorage.setItem('reaper_projects', JSON.stringify(updatedProjects))

    if (isFirebaseReady && db) {
      try {
        updatedProjects.forEach(p => {
          setDoc(doc(db, `artifacts/${APP_ID}/phantomResources/${p.id}`), {
            projectId: p.id,
            projectName: p.name,
            leakedCost: p.cost,
            isReaped: p.reaped
          }, { merge: true }).catch(e => console.error("Firebase save projects error:", e))
        })
      } catch (e) {
        console.warn("Firestore sync failed:", e)
      }
    }
  }

  // Real-time Debt Tickers state
  const [carbonDebt, setCarbonDebt] = useState(() => {
    try {
      const saved = localStorage.getItem('carbon_debt')
      if (saved) {
        const num = Number(saved)
        if (!isNaN(num)) return num
      }
    } catch {}
    return 1200.0
  })
  const [financialDebt, setFinancialDebt] = useState(() => {
    try {
      const saved = localStorage.getItem('financial_debt')
      if (saved) {
        const num = Number(saved)
        if (!isNaN(num)) return num
      }
    } catch {}
    return 3450.00
  })

  // User input base tick rates
  const [userCarbonRate, setUserCarbonRate] = useState(() => {
    try {
      const val = localStorage.getItem('user_carbon_rate')
      if (val) {
        const num = Number(val)
        if (!isNaN(num)) return num
      }
    } catch {}
    return 0.5
  })
  const [userFinRate, setUserFinRate] = useState(() => {
    try {
      const val = localStorage.getItem('user_fin_rate')
      if (val) {
        const num = Number(val)
        if (!isNaN(num)) return num
      }
    } catch {}
    return 2.1
  })

  // Calculated rates (adjusted based on active systems)
  const currentCarbonRate = useMemo(() => {
    let rate = userCarbonRate
    if (lightsOut) rate *= 0.1
    if (!cureResolved) rate *= 2.5 // Carbon penalty during exploit
    return rate
  }, [userCarbonRate, lightsOut, cureResolved])

  const currentFinRate = useMemo(() => {
    let rate = userFinRate
    if (lightsOut) rate *= 0.1
    if (!cureResolved) rate *= 2.5
    return rate
  }, [userFinRate, lightsOut, cureResolved])

  // Synchronize dynamic rates to Firestore/local storage
  useEffect(() => {
    localStorage.setItem('user_carbon_rate', String(userCarbonRate))
    localStorage.setItem('user_fin_rate', String(userFinRate))
    
    if (isFirebaseReady && db) {
      try {
        setDoc(doc(db, `artifacts/${APP_ID}/debtMetrics/current`), {
          baseDebtCarbon: carbonDebt,
          tickRateCarbon: currentCarbonRate,
          baseDebtFinancial: financialDebt,
          tickRateFinancial: currentFinRate,
          updatedAt: Date.now()
        }, { merge: true }).catch(e => console.log("Firebase sync debt metrics error:", e))
      } catch (e) {
        console.warn("Firestore sync failed:", e)
      }
    }
  }, [userCarbonRate, userFinRate, currentCarbonRate, currentFinRate])

  // Frame tick animation for debt accumulators
  const lastTickTime = useRef(performance.now())
  useEffect(() => {
    let animFrame
    const tick = (now) => {
      const dt = (now - lastTickTime.current) / 1000
      lastTickTime.current = now

      setCarbonDebt(prev => {
        const next = prev + currentCarbonRate * dt
        localStorage.setItem('carbon_debt', String(next))
        return next
      })

      setFinancialDebt(prev => {
        const next = prev + currentFinRate * dt
        localStorage.setItem('financial_debt', String(next))
        return next
      })

      animFrame = requestAnimationFrame(tick)
    }

    lastTickTime.current = performance.now()
    animFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animFrame)
  }, [currentCarbonRate, currentFinRate])

  // Firebase Realtime Listeners Sync
  useEffect(() => {
    if (!isFirebaseReady || !db) return

    // Lights out listener
    const lightsOutUnsub = onSnapshot(doc(db, `artifacts/${APP_ID}/lightsOut/current`), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data()
        if (data.shiftStart !== undefined) setShiftStart(data.shiftStart)
        if (data.shiftEnd !== undefined) setShiftEnd(data.shiftEnd)
        if (data.isActive !== undefined) setLightsOut(data.isActive)
        triggerToast("Shift schedule synced with Cloud Platforms", "success")
      }
    }, (err) => console.log("Lights out listener error:", err))

    // Subcontractors listener
    const subsUnsub = onSnapshot(doc(db, `artifacts/${APP_ID}/subcontractors/list`), (docSnap) => {
      if (docSnap.exists()) {
        const docData = docSnap.data()
        if (Array.isArray(docData.data)) {
          setSubs(docData.data)
          localStorage.setItem('subs_list', JSON.stringify(docData.data))
        }
      }
    }, (err) => console.log("Subs list listener error:", err))

    return () => {
      lightsOutUnsub()
      subsUnsub()
    }
  }, [dbStatus])

  // Terminate Action
  const terminateProject = (id, name) => {
    const updated = projects.map(p => p.id === id ? { ...p, reaped: true } : p)
    saveProjects(updated)
    triggerToast(`Phantom resources reclaimed for ${name}! Carbon leak sealed.`, "success")
  }

  // Toggle subcontractor cloud access
  const toggleSubAccess = (id) => {
    const updated = subs.map(s => {
      if (s.id === id) {
        if (s.phase === 'Completed') return s // strictly revoked
        const nextStatus = s.accessStatus === 'Granted' ? 'Revoked' : 'Granted'
        triggerToast(`${s.name} access changed to ${nextStatus}`, nextStatus === 'Granted' ? 'info' : 'warning')
        return { ...s, accessStatus: nextStatus }
      }
      return s
    })
    saveSubs(updated)
  }

  // Force Revoke Completed Subcontractors (Compliance check)
  useEffect(() => {
    let corrected = false
    const updated = subs.map(s => {
      if (s.phase === 'Completed' && s.accessStatus !== 'Revoked') {
        corrected = true
        return { ...s, accessStatus: 'Revoked' }
      }
      return s
    })
    if (corrected) {
      saveSubs(updated)
      triggerToast("Compliance check: Automatically revoked completed subcontractor access.", "warning")
    }
  }, [subs])

  // Calculated Compliance telemetry indicators
  const complianceScore = useMemo(() => {
    // If simulated threat is currently active or unmitigated
    if (!cureResolved) {
      return 35
    }
    
    // Average sub score + reaped project ratio
    const totalSubs = subs.length || 1
    const avgSubScore = subs.reduce((acc, s) => acc + getScore(s.downloads, s.hours), 0) / totalSubs
    const unreapedCount = projects.filter(p => !p.reaped).length
    const reapedDeduction = unreapedCount * 8
    
    return Math.max(10, Math.min(100, Math.round(avgSubScore - reapedDeduction)))
  }, [subs, projects, cureResolved])

  const totalReclaimedCost = useMemo(() => {
    return projects.filter(p => p.reaped).reduce((acc, p) => acc + p.cost, 0)
  }, [projects])

  const activeHoursCount = useMemo(() => {
    return shiftEnd - shiftStart
  }, [shiftStart, shiftEnd])

  const co2SavedDaily = useMemo(() => {
    const energySavedKwh = (24 - activeHoursCount) * 22
    return energySavedKwh * 2.9
  }, [activeHoursCount])

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-rose-50 via-violet-50 to-teal-50 text-slate-700 overflow-x-hidden transition-colors duration-300">
      {/* Toast Notification Deck */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-xl pointer-events-auto transform transition-all ${
            t.type === 'success' ? 'bg-teal-400/20 border-teal-200 text-teal-600' :
            t.type === 'warning' ? 'bg-rose-400/20 border-rose-200 text-rose-600' :
            'bg-sky-400/20 border-sky-200 text-sky-600'
          }`}>
            {t.type === 'success' && <IconCheck className="w-5 h-5 shrink-0" />}
            {t.type === 'warning' && <IconAlert className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-medium">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white/60 backdrop-blur-xl text-slate-700 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r border-white/50 flex flex-col justify-between ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header/Logo */}
          <div className="p-6 border-b border-white/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-rose-300 to-rose-400 rounded-lg shadow-lg">
                <IconShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-md font-extrabold tracking-tight text-slate-700 leading-none">BUILDSHIELD</h1>
                <span className="text-xs text-rose-400 font-bold tracking-wider">NEXUSOP</span>
              </div>
            </div>
            <button className="lg:hidden p-1 text-slate-500 hover:text-slate-700" onClick={() => setSidebarOpen(false)}>
              <IconClose className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1">
            {[
              { id: 'dashboard', label: 'Central Dashboard', icon: IconHome },
              { id: 'debt-clock', label: 'Carbon & Security Debt', icon: IconClock },
              { id: 'lights-out', label: 'Lights Out Protocol', icon: IconCalendar },
              { id: 'trust-score', label: 'Subcontractor Trust', icon: IconUsers },
              { id: 'phantom-reaper', label: 'Phantom Auto-Reaper', icon: IconGhost },
              { id: 'chaos-cure', label: 'Chaos & Cure Demo', icon: IconTerminal },
            ].map(item => {
              const Icon = item.icon
              const isActive = activePage === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-rose-200/50 text-rose-600 font-medium backdrop-blur-md border border-rose-200 shadow-sm shadow-rose-200/50'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-700 hover:backdrop-blur-md hover:border hover:border-white/50'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-rose-400' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.id === 'chaos-cure' && !cureResolved && (
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400 active-pulse" />
                  )}
                  {item.id === 'phantom-reaper' && projects.some(p => !p.reaped) && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-200/50 text-rose-600 rounded-full border border-rose-200">
                      {projects.filter(p => !p.reaped).length}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* User / Database Status Card */}
        <div className="p-4 border-t border-white/50 bg-white/40 backdrop-blur-md rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cloud Integrity</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
              dbStatus === 'connected'
                ? 'bg-teal-100 border-teal-200 text-teal-600'
                : 'bg-orange-100 border-orange-200 text-orange-600'
            }`}>
              {dbStatus === 'connected' ? 'CONNECTED' : 'LOCAL CACHE'}
            </span>
          </div>
          
          <div className="flex items-center gap-3 p-2 bg-white/60 backdrop-blur-md rounded-lg border border-white/60">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-300 to-rose-400 flex items-center justify-center font-bold text-sm text-white">
              HG
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 truncate">Hilti Jobsite Administrator</p>
              <p className="text-[10px] text-slate-500 truncate">Cloud security platform</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex justify-between items-center px-6 py-4 bg-white/60 border-b border-white/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-white/60 rounded-xl"
            >
              <IconMenu className="w-6 h-6" />
            </button>
            <div className="hidden lg:block">
              <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span>BuildShield Platform</span>
                <IconChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-700 font-semibold capitalize">{activePage.replace('-', ' ')}</span>
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(p => p === 'light' ? 'dark' : 'light')}
              className="p-2 text-slate-500 hover:bg-white/60 rounded-xl transition-all"
              title="Toggle theme"
            >
              {theme === 'light' ? <IconMoon className="w-5 h-5" /> : <IconSun className="w-5 h-5" />}
            </button>

            {/* Simulated Live Alert Indicator */}
            {!cureResolved && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-200/50 border border-rose-300 rounded-full text-rose-600 text-xs font-semibold active-pulse backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span className="hidden md:inline">SYSTEM EXPLOIT SIMULATION RUNNING</span>
                <span className="md:hidden">ACTIVE EXPLOIT</span>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Route Rendering */}
        <main className="flex-grow p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activePage === 'dashboard' && (
            <DashboardView
              complianceScore={complianceScore}
              carbonDebt={carbonDebt}
              financialDebt={financialDebt}
              co2SavedDaily={co2SavedDaily}
              totalReclaimedCost={totalReclaimedCost}
              lightsOut={lightsOut}
              shiftStart={shiftStart}
              shiftEnd={shiftEnd}
              cureResolved={cureResolved}
              projects={projects}
              subs={subs}
              setActivePage={setActivePage}
              triggerToast={triggerToast}
              saveProjects={saveProjects}
              saveSubs={saveSubs}
              getScore={getScore}
            />
          )}

          {activePage === 'debt-clock' && (
            <CarbonDebtClock />
          )}

          {activePage === 'lights-out' && (
            <LightsOutPage
              shiftStart={shiftStart}
              setShiftStart={setShiftStart}
              shiftEnd={shiftEnd}
              setShiftEnd={setShiftEnd}
              lightsOut={lightsOut}
              setLightsOut={setLightsOut}
              co2SavedDaily={co2SavedDaily}
              activeHoursCount={activeHoursCount}
              triggerToast={triggerToast}
            />
          )}

          {activePage === 'trust-score' && (
            <TrustScorePage
              subs={subs}
              toggleSubAccess={toggleSubAccess}
              getScore={getScore}
              saveSubs={saveSubs}
              triggerToast={triggerToast}
            />
          )}

          {activePage === 'phantom-reaper' && (
            <PhantomReaperPageNew />
          )}

          {activePage === 'chaos-cure' && (
            <ChaosCurePage
              cureResolved={cureResolved}
              setCureResolved={setCureResolved}
              triggerToast={triggerToast}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="py-6 px-8 border-t border-white/50 bg-white/40 backdrop-blur-md text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BuildShield NEXUSOP · Cloud Telemetry & Zero-Trust Framework for Construction Sites.</p>
        </footer>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
 * 1. CENTRAL DASHBOARD VIEW
 * ------------------------------------------------------------- */
function DashboardView({
  complianceScore,
  carbonDebt,
  financialDebt,
  co2SavedDaily,
  totalReclaimedCost,
  lightsOut,
  shiftStart,
  shiftEnd,
  cureResolved,
  projects,
  subs,
  setActivePage,
  triggerToast,
  saveProjects,
  saveSubs,
  getScore
}) {
  const getSubColor = (s) => s > 80 ? 'bg-teal-400' : s >= 50 ? 'bg-orange-300' : 'bg-rose-400'
  const activeLeakedCost = projects.filter(p => !p.reaped).reduce((acc, p) => acc + p.cost, 0)
  const activeCarbonLeak = projects.filter(p => !p.reaped).reduce((acc, p) => acc + p.co2, 0)

  // One-click resolve for all phantom database infrastructure leaks
  const reclaimAllLeaks = () => {
    const active = projects.filter(p => !p.reaped)
    if (active.length === 0) {
      triggerToast("No active leaks found to reclaim.", "info")
      return
    }
    const updated = projects.map(p => ({ ...p, reaped: true }))
    saveProjects(updated)
    triggerToast(`Batch Reclaimed: ${active.length} resource collections reclaimed! Carbon leaks sealed.`, "success")
  }

  // Compliance enforcement: automatically revoke access to all terminated subcontractor contracts
  const forceEnforceCompliance = () => {
    const expiredAccess = subs.filter(s => s.phase === 'Completed' && s.accessStatus === 'Granted')
    if (expiredAccess.length === 0) {
      triggerToast("All subcontractor access controls conform to contract phases.", "success")
      return
    }
    const updated = subs.map(s => s.phase === 'Completed' ? { ...s, accessStatus: 'Revoked' } : s)
    saveSubs(updated)
    triggerToast(`Compliance enforced: Revoked cloud IAM permissions for ${expiredAccess.length} terminated subs.`, "success")
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative p-6 lg:p-8 rounded-2xl overflow-hidden border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Hilti Jobsite Cloud Operations</h2>
          <p className="text-slate-500 max-w-xl text-sm">
            Bridging the physical construction lifecycles with secure, energy-aware virtual environments.
          </p>
        </div>
        
        {/* Large Compliance Dial Widget */}
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 rounded-xl border border-white/80 z-10 shrink-0">
          <div className="relative flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="28" className="stroke-slate-200" strokeWidth="6" fill="none" />
              <circle
                cx="32"
                cy="32"
                r="28"
                className={`transition-all duration-500 ${
                  complianceScore > 80 ? 'stroke-teal-400' : complianceScore >= 50 ? 'stroke-orange-400' : 'stroke-rose-400'
                }`}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - (isNaN(complianceScore) ? 100 : complianceScore) / 100)}
                fill="none"
              />
            </svg>
            <span className="absolute text-sm font-bold tracking-tight text-slate-700">{complianceScore}%</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compliance Index</p>
            <p className="text-sm font-bold text-slate-700">
              {complianceScore > 80 ? '🔒 Cloud Secure' : complianceScore >= 50 ? '⚠️ Advisory Level' : '🚨 Breach Risk Alert'}
            </p>
          </div>
        </div>
      </div>

      {/* Top Level Real-Time KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Carbon Debt */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-5 space-y-4 shadow-sm shadow-rose-100">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Carbon Debt</span>
            <div className="p-1.5 bg-rose-100 rounded-lg text-rose-500">
              <IconClock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-mono font-bold text-rose-500">
              {carbonDebt.toFixed(2)}
            </p>
            <span className="text-xs text-slate-400">kg CO2 accumulated</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 active-pulse" />
            <span>Active Rate: {lightsOut && cureResolved ? '0.01x' : lightsOut || !cureResolved ? 'Scaled' : '1.00x'} base</span>
          </div>
        </div>

        {/* KPI 2: Financial Waste */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-5 space-y-4 shadow-sm shadow-orange-100">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Financial Waste</span>
            <div className="p-1.5 bg-orange-100 rounded-lg text-orange-500">
              <IconDatabase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-mono font-bold text-orange-400">
              RM{financialDebt.toFixed(2)}
            </p>
            <span className="text-xs text-slate-400">Unoptimized cloud costs</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-orange-400">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 active-pulse" />
            <span>Accumulating...</span>
          </div>
        </div>

        {/* KPI 3: Carbon Savings (Daily) */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-5 space-y-4 shadow-sm shadow-teal-100">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Daily Carbon Saved</span>
            <div className="p-1.5 bg-teal-100 rounded-lg text-teal-500">
              <IconSun className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-mono font-bold text-teal-500 dark:text-teal-400">
              {lightsOut ? co2SavedDaily.toFixed(1) : '0.0'}
            </p>
            <span className="text-xs text-slate-400">kg CO2 prevented today</span>
          </div>
          <p className="text-xs text-slate-400">
            {lightsOut ? '💡 Lights Out Protocol Active' : '⏸️ Shift limits bypassed'}
          </p>
        </div>

        {/* KPI 4: Costs Reclaimed */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-5 space-y-4 shadow-sm shadow-indigo-100">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Reclaimed Capital</span>
            <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-500">
              <IconGhost className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-mono font-bold text-indigo-500 dark:text-indigo-400">
              RM{totalReclaimedCost.toFixed(2)}
            </p>
            <span className="text-xs text-slate-400">Total costs reaped</span>
          </div>
          <p className="text-xs text-slate-400">
            {projects.filter(p => !p.reaped).length} completed projects leak cost
          </p>
        </div>
      </div>

      {/* Quick Enforcements Panel */}
      <div className="p-5 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Operations Command Center</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={reclaimAllLeaks}
            className="flex items-center justify-between p-4 rounded-xl border border-rose-200 bg-rose-50 backdrop-blur-sm hover:bg-rose-100 text-rose-600 font-bold transition text-left group"
          >
            <div>
              <p className="text-sm">Batch Reclaim Phantom Leaks</p>
              <span className="text-xs text-rose-400 font-normal">Reclaim ${activeLeakedCost.toFixed(2)} cost & {activeCarbonLeak.toFixed(1)} kg CO2 daily</span>
            </div>
            <IconGhost className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={forceEnforceCompliance}
            className="flex items-center justify-between p-4 rounded-xl border border-teal-200 bg-teal-50 backdrop-blur-sm hover:bg-teal-100 text-teal-600 font-bold transition text-left group"
          >
            <div>
              <p className="text-sm">Enforce Contractor Access</p>
              <span className="text-xs text-teal-500 font-normal">Auto-revoke terminated contractors</span>
            </div>
            <IconShield className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => {
              setActivePage('chaos-cure')
              triggerToast("Routing to Zero-Day Exploit simulator", "info")
            }}
            className="flex items-center justify-between p-4 rounded-xl border border-orange-200 bg-orange-50 backdrop-blur-sm hover:bg-orange-100 text-orange-600 font-bold transition text-left group"
          >
            <div>
              <p className="text-sm">Launch Zero-Day Simulator</p>
              <span className="text-xs text-orange-400 font-normal">Trigger cyber containment demo</span>
            </div>
            <IconTerminal className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Feature Navigation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lights Out Quick Widget */}
        <div
          onClick={() => setActivePage('lights-out')}
          className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-5 space-y-4 cursor-pointer group shadow-sm transition hover:shadow-md"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-700 group-hover:text-rose-400 transition-colors">
              💡 Lights Out Schedule
            </h3>
            <IconChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-500">
            Pause dev/staging instances during non-working jobsite shifts.
          </p>
          <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg border border-white/80 flex justify-between items-center text-xs">
            <div>
              <p className="font-semibold text-slate-500">Active Shift Hours</p>
              <p className="font-bold text-sm text-slate-700">{lightsOut ? `${shiftStart}:00 - ${shiftEnd}:00` : 'Disabled (Bypassed)'}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-500 text-right">Daily Prevention</p>
              <p className="font-bold text-teal-500 text-sm text-right">-{co2SavedDaily.toFixed(1)} kg CO2</p>
            </div>
          </div>
        </div>

        {/* Subcontractor Trust Quick Widget */}
        <div
          onClick={() => setActivePage('trust-score')}
          className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 p-5 space-y-4 cursor-pointer group shadow-sm transition hover:shadow-md"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-700 group-hover:text-rose-400 transition-colors">
              👥 Subcontractor Trust Status
            </h3>
            <IconChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-500">
            Monitor real-time network traffic and trust telemetry.
          </p>
          <div className="space-y-2">
            {subs.slice(0, 2).map(s => {
              const scoreVal = getScore(s.downloads, s.hours)
              return (
                <div key={s.id} className="flex items-center justify-between text-xs p-1">
                  <span className="font-medium text-slate-600">{s.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className={`h-full ${getSubColor(scoreVal)}`} style={{ width: `${scoreVal}%` }} />
                    </div>
                    <span className="font-bold text-slate-700">{scoreVal}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
 * 2. CARBON & SECURITY DEBT CLOCK PAGE
 * ------------------------------------------------------------- */
function DebtClockPage({
  carbonDebt,
  financialDebt,
  userCarbonRate,
  setUserCarbonRate,
  userFinRate,
  setUserFinRate,
  currentCarbonRate,
  currentFinRate,
  lightsOut,
  cureResolved
}) {
  // Generate forecasting data based on rates
  const projectionData = useMemo(() => {
    const data = []
    const baseCarbon = carbonDebt
    for (let hour = 0; hour <= 24; hour += 4) {
      const rateBAU = userCarbonRate
      const rateLightsOut = userCarbonRate * (lightsOut ? 0.3 : 1.0)
      const rateOpt = userCarbonRate * 0.01
      
      data.push({
        name: `+${hour}h`,
        BAU: Math.round(baseCarbon + rateBAU * hour * 3600),
        'Shift Control': Math.round(baseCarbon + rateLightsOut * hour * 3600),
        'AI Optimized': Math.round(baseCarbon + rateOpt * hour * 3600),
      })
    }
    return data
  }, [carbonDebt, userCarbonRate, lightsOut])

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">⏱️ Carbon & Security Debt Clock</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Calculates ongoing environmental emissions and financial overhead generated by inactive servers and unmitigated security exploits.
        </p>
      </div>

      {/* Giant Live Debt Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carbon Debt Counter */}
        <div className="p-6 lg:p-8 rounded-2xl border border-rose-200 dark:border-rose-300 bg-white/80 dark:bg-[#f8fafc] backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col justify-between h-56">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-rose-400 dark:text-rose-400 uppercase tracking-wider block">Carbon Accumulator</span>
            <h3 className="text-xs text-slate-400">Dynamic CO2 release estimation</h3>
          </div>
          <div>
            <p className="text-4xl lg:text-5xl font-mono font-bold text-rose-500 dark:text-rose-400 tracking-tight">
              {carbonDebt.toFixed(3)}
            </p>
            <span className="text-xs text-slate-400">kg CO2 emissions in progress</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 border-t border-rose-100 dark:border-slate-200 pt-3">
            <span>Base Rate: {userCarbonRate.toFixed(2)}/s</span>
            <span className="font-semibold text-rose-500">Current Adjusted: {currentCarbonRate.toFixed(3)}/s</span>
          </div>
        </div>

        {/* Financial Debt Counter */}
        <div className="p-6 lg:p-8 rounded-2xl border border-orange-200 dark:border-orange-300 bg-white/80 dark:bg-[#f8fafc] backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col justify-between h-56">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-orange-400 dark:text-orange-400 uppercase tracking-wider block">Financial Waste Clock</span>
            <h3 className="text-xs text-slate-400">Idle cloud CPU and unoptimized storage cost</h3>
          </div>
          <div>
            <p className="text-4xl lg:text-5xl font-mono font-bold text-orange-400 dark:text-orange-400 tracking-tight">
              RM{financialDebt.toFixed(2)}
            </p>
            <span className="text-xs text-slate-400">MYR accumulated losses</span>
          </div>
          <div className="flex justify-between text-xs text-slate-500 border-t border-orange-100 dark:border-slate-200 pt-3">
            <span>Base Rate: RM{userFinRate.toFixed(2)}/s</span>
            <span className="font-semibold text-orange-500">Current Adjusted: RM{currentFinRate.toFixed(3)}/s</span>
          </div>
        </div>
      </div>

      {/* Adjust Rates Panel */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-200 bg-white/80 backdrop-blur-md shadow-sm space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Baseline Telemetry Calibration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-500">Base Carbon Accumulation Rate</label>
              <span className="font-mono text-sm font-semibold">{userCarbonRate.toFixed(2)} kg/s</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5.0"
              step="0.05"
              value={userCarbonRate}
              onChange={(e) => setUserCarbonRate(Number(e.target.value))}
              className="w-full accent-rose-400"
            />
            <p className="text-xs text-slate-400">
              Corresponds to average jobsite load size. Larger sites run larger databases, yielding higher base carbon release.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-600 dark:text-slate-500">Base Cost Waste Rate</label>
              <span className="font-mono text-sm font-semibold">${userFinRate.toFixed(2)} /s</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10.0"
              step="0.1"
              value={userFinRate}
              onChange={(e) => setUserFinRate(Number(e.target.value))}
              className="w-full accent-orange-400"
            />
            <p className="text-xs text-slate-400">
              Corresponds to on-demand pricing rates. Standard rates fluctuate between $0.50/s and $10/s.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Forecast Projection Chart */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-200 bg-white/80 backdrop-blur-md shadow-sm space-y-6">
        <div className="space-y-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">24-Hour Carbon Debt Forecasting</h3>
          <p className="text-xs text-slate-400">
            Calculated comparison of projected cumulative carbon emissions under different power schedules.
          </p>
         </div>

        <div className="h-80 w-full bg-slate-50/50 dark:bg-slate-50/80 p-4 rounded-xl border border-slate-100 dark:border-slate-200">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBAU" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fb7185" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorControl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  color: '#334155',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="BAU" stroke="#fb7185" strokeWidth={2} fillOpacity={1} fill="url(#colorBAU)" />
              <Area type="monotone" dataKey="Shift Control" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorControl)" />
              <Area type="monotone" dataKey="AI Optimized" stroke="#2dd4bf" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOpt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
 * 3. JOBSITE "LIGHTS OUT" PROTOCOL (SHIFT SCHEDULER)
 * ------------------------------------------------------------- */
function LightsOutPage({
  shiftStart,
  setShiftStart,
  shiftEnd,
  setShiftEnd,
  lightsOut,
  setLightsOut,
  co2SavedDaily,
  activeHoursCount,
  triggerToast
}) {
  const [syncing, setSyncing] = useState(false)

  // Pre-configured global jobsite servers with localized shift recommendations
  const [servers] = useState([
    { id: 'ap-southeast-1', location: 'Alor Gajah, Malaysia (AP-South)', tz: 'MYT (UTC+8)', suggestedStart: 8, suggestedEnd: 18 },
    { id: 'ap-southeast-2', location: 'Singapore (AP-South)', tz: 'SGT (UTC+8)', suggestedStart: 8, suggestedEnd: 18 },
    { id: 'us-east-1', location: 'New York, USA (US-East)', tz: 'EST (UTC-5)', suggestedStart: 7, suggestedEnd: 17 },
    { id: 'eu-central-1', location: 'Frankfurt, Germany (EU-Central)', tz: 'CET (UTC+1)', suggestedStart: 7, suggestedEnd: 16 }
  ])
  
  const [selectedServerId, setSelectedServerId] = useState(servers[0].id)
  const activeServer = useMemo(() => servers.find(s => s.id === selectedServerId) || servers[0], [servers, selectedServerId])

  const barChartData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      active: i >= shiftStart && i < shiftEnd ? 1 : 0,
      label: `${String(i).padStart(2, '0')}:00`
    }))
  }, [shiftStart, shiftEnd])

  const applySuggestion = () => {
    setShiftStart(activeServer.suggestedStart)
    setShiftEnd(activeServer.suggestedEnd)
    triggerToast(`Applied suggested local shift times for ${activeServer.location}`, "info")
  }

  const handleSyncCloud = () => {
    setSyncing(true)
    setTimeout(() => {
      setSyncing(false)
      setLightsOut(true)
      localStorage.setItem('lightsOutActive', 'true')
      localStorage.setItem('shiftStart', String(shiftStart))
      localStorage.setItem('shiftEnd', String(shiftEnd))
      
      if (isFirebaseReady && db) {
        try {
          setDoc(doc(db, `artifacts/${APP_ID}/lightsOut/current`), {
            shiftStart: shiftStart,
            shiftEnd: shiftEnd,
            isActive: true,
            timezone: activeServer.tz,
            serverId: selectedServerId,
            updatedAt: Date.now()
          }).catch(e => console.error("Firebase save lights out error:", e))
        } catch (e) {
          console.warn("Firestore sync failed:", e)
        }
      }
      
      triggerToast(`Regional policy enforced! Server synced to ${activeServer.tz}.`, "success")
    }, 1500)
  }

  const formatHourString = (hour) => `${String(hour).padStart(2, '0')}:00`

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">💡 Jobsite "Lights Out" Protocol</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Automates cloud resource states based on the physical jobsite's regional timezone, preventing out-of-state schedule conflicts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduler Controls */}
        <div className="lg:col-span-1 p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Regional Server Config</h3>
            <p className="text-xs text-slate-400">Automated shift control by country server.</p>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-600 mb-1.5">Target Jobsite Server</label>
              <select
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold outline-none focus:border-rose-300 transition-colors text-slate-700"
              >
                {servers.map(s => (
                  <option key={s.id} value={s.id}>{s.location}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600 mb-1.5">Shift Start</label>
                <select
                  value={shiftStart}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val < shiftEnd) {
                      setShiftStart(val);
                    } else {
                      triggerToast("Shift start must be earlier than shift end", "warning");
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold outline-none focus:border-rose-300 transition-colors text-slate-700"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{formatHourString(i)}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-600 mb-1.5">Shift End</label>
                <select
                  value={shiftEnd}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > shiftStart) {
                      setShiftEnd(val);
                    } else {
                      triggerToast("Shift end must be later than shift start", "warning");
                    }
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold outline-none focus:border-rose-300 transition-colors text-slate-700"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{formatHourString(i)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Timezone</span>
                <span className="font-bold text-slate-700">{activeServer.tz}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Suggested Shift</span>
                <span className="font-bold text-teal-500">
                  {formatHourString(activeServer.suggestedStart)} - {formatHourString(activeServer.suggestedEnd)}
                </span>
              </div>
            </div>

            <button
              onClick={applySuggestion}
              className="w-full py-2.5 text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors border border-rose-200"
            >
              Apply Regional Suggestion
            </button>

            <button
              onClick={handleSyncCloud}
              className={`w-full font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition ${
                syncing
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-rose-400 text-white hover:bg-rose-500 shadow-sm shadow-rose-200'
              }`}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <IconRefresh className="w-5 h-5 animate-spin" />
                  <span>Syncing Registry...</span>
                </>
              ) : (
                <span>Enforce Regional Policy</span>
              )}
            </button>

            {lightsOut && (
              <button
                onClick={() => {
                  setLightsOut(false)
                  localStorage.setItem('lightsOutActive', 'false')
                  if (isFirebaseReady && db) {
                    try {
                      setDoc(doc(db, `artifacts/${APP_ID}/lightsOut/current`), {
                        shiftStart: shiftStart,
                        shiftEnd: shiftEnd,
                        isActive: false,
                        timezone: activeServer.tz,
                        serverId: selectedServerId,
                        updatedAt: Date.now()
                      }).catch(e => console.error("Firebase save lights out error:", e))
                    } catch (e) {
                      console.warn("Firestore sync failed:", e)
                    }
                  }
                  triggerToast("Regional schedule disabled. Uptime set to unrestricted (24/7).", "warning")
                }}
                className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Disable Regional Schedule
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Uptime Visualization */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">24-Hour Resource Allocation Timeline</h3>
            <p className="text-xs text-slate-400">
              Indigo columns highlight construction shifts (active uptime). Short gray columns represent automated off-shift pause states.
            </p>
          </div>

          <div className="h-56 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} barGap={0} margin={{ top: 10, right: 0, left: -40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="0" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={2} stroke="#94a3b8" />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    color: '#334155',
                    fontSize: '11px',
                  }}
                  formatter={(value) => [value ? 'Active Shift (100% Resource Allocation)' : 'Lights Out (Cloud Shutdown Active)', 'State']}
                />
                <Bar dataKey="active" radius={[3, 3, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.active ? '#818cf8' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div className="bg-teal-50 border border-teal-100 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Carbon prevented</span>
              <p className="text-base font-bold text-teal-500 mt-1">{co2SavedDaily.toFixed(1)} kg CO2</p>
              <span className="text-[10px] text-slate-400">prevented daily</span>
            </div>
            
            <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Shift Length</span>
              <p className="text-base font-bold text-sky-500 mt-1">{activeHoursCount} hours</p>
              <span className="text-[10px] text-slate-400">active window</span>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Attack Reduction</span>
              <p className="text-base font-bold text-indigo-400 mt-1">{(((24 - activeHoursCount) / 24) * 100).toFixed(0)}%</p>
              <span className="text-[10px] text-slate-400">exposure reduction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
 * 4. SUBCONTRACTOR TRUST SCORE PAGE
 * ------------------------------------------------------------- */
function TrustScorePage({ subs, toggleSubAccess, getScore, saveSubs, triggerToast }) {
  const [search, setSearch] = useState('')
  const [filterPhase, setFilterPhase] = useState('All')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSubName, setNewSubName] = useState('')
  const [newSubPhase, setNewSubPhase] = useState('Active')
  const [newSubDl, setNewSubDl] = useState(10)
  const [newSubHours, setNewSubHours] = useState(5.0)

  const getSubColor = (s) => s > 80 ? 'bg-teal-400' : s >= 50 ? 'bg-orange-300' : 'bg-rose-400'
  const getSubText = (s) => s > 80 ? 'text-teal-600 border-teal-200 bg-teal-50' : s >= 50 ? 'text-orange-600 border-orange-200 bg-orange-50' : 'text-rose-500 border-rose-200 bg-rose-50'

  const filteredSubs = useMemo(() => {
    return subs.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase())
      const matchesPhase = filterPhase === 'All' || s.phase === filterPhase
      return matchesSearch && matchesPhase
    })
  }, [subs, search, filterPhase])

  const handleAddSub = (e) => {
    e.preventDefault()
    if (!newSubName.trim()) {
      triggerToast("Please fill in the subcontractor name.", "warning")
      return
    }

    const newSub = {
      id: Date.now(),
      name: newSubName,
      phase: newSubPhase,
      downloads: Number(newSubDl),
      hours: Number(newSubHours),
      accessStatus: newSubPhase === 'Completed' ? 'Revoked' : 'Granted'
    }

    saveSubs([...subs, newSub])
    setNewSubName('')
    setShowAddForm(false)
    triggerToast(`Added subcontractor ${newSub.name} to security index.`, "success")
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">👥 Subcontractor Trust Score</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Monitors real-time activity, data access frequencies, and revokes credentials instantly when contracts complete.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-rose-400 hover:bg-rose-500 text-white font-bold text-sm shadow-sm flex items-center gap-2 self-start md:self-auto transition"
        >
          {showAddForm ? 'Cancel Add' : 'Add Subcontractor'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSub} className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm space-y-4 max-w-xl animate-slide-in">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Register Subcontractor</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold mb-1.5 text-slate-500">Subcontractor Name</label>
              <input
                type="text"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                placeholder="Apex Structural Ltd"
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold outline-none focus:border-rose-300 transition-colors text-slate-700"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold mb-1.5 text-slate-500">Contract Status</label>
              <select
                value={newSubPhase}
                onChange={(e) => setNewSubPhase(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold outline-none focus:border-rose-300 transition-colors"
              >
                <option value="Active">Active Contract</option>
                <option value="Completed">Completed Contract</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold mb-1.5 text-slate-500">Simulated Downloads</label>
              <input
                type="number"
                min="0"
                max="500"
                value={newSubDl}
                onChange={(e) => setNewSubDl(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold outline-none focus:border-rose-300 transition-colors text-slate-700"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold mb-1.5 text-slate-500">Simulated Sync Uptime (hrs)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={newSubHours}
                onChange={(e) => setNewSubHours(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm font-semibold outline-none focus:border-rose-300 transition-colors text-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-400 hover:bg-teal-500 text-white font-bold text-sm rounded-xl transition"
            >
              Confirm Registration
            </button>
          </div>
        </form>
      )}

      {/* Searching & Filters */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <IconSearch />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subcontractors by registry name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:border-rose-300 transition-all text-slate-700"
          />
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-sm shrink-0">
          <span className="text-slate-500 font-medium">Contract Phase:</span>
          <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            {['All', 'Active', 'Completed'].map(phase => (
              <button
                key={phase}
                onClick={() => setFilterPhase(phase)}
                className={`px-3 py-1.5 font-bold text-xs transition-colors ${
                  filterPhase === phase
                    ? 'bg-rose-400 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                <th className="py-4 px-6">Contractor / Details</th>
                <th className="py-4 px-6">Contract phase</th>
                <th className="py-4 px-6">Activity metrics</th>
                <th className="py-4 px-6">Usage Workload</th>
                <th className="py-4 px-6">Network access status</th>
                <th className="py-4 px-6 text-right">Emergency Button</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSubs.length > 0 ? (
                filteredSubs.map(sub => {
                  const scoreVal = getScore(sub.downloads, sub.hours)
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 text-sm transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-700">{sub.name}</p>
                        <span className="text-xs text-slate-400 font-mono">UID-{sub.id.toString().slice(-6)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          sub.phase === 'Active'
                            ? 'bg-indigo-50 text-indigo-500 border border-indigo-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {sub.phase}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {sub.downloads} files downloaded · {sub.hours}h active syncs
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden shrink-0">
                            <div className={`h-full rounded-full transition-all duration-500 ${getSubColor(scoreVal)}`} style={{ width: `${scoreVal}%` }} />
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getSubText(scoreVal)}`}>
                            {scoreVal}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${
                          sub.accessStatus === 'Granted'
                            ? 'text-teal-500'
                            : 'text-rose-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            sub.accessStatus === 'Granted' ? 'bg-teal-400' : 'bg-rose-400 active-pulse'
                          }`} />
                          {sub.accessStatus === 'Granted' ? 'Cloud Access Active' : 'Access Suspended'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sub.accessStatus === 'Granted'}
                            onChange={() => toggleSubAccess(sub.id)}
                            disabled={sub.phase === 'Completed'}
                            className="sr-only peer switch-input"
                          />
                          <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-rose-200 peer-checked:bg-teal-400 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                        </label>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                    No subcontractor registry matches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
 * 5. PHANTOM INFRASTRUCTURE AUTO-REAPER PAGE
 * ------------------------------------------------------------- */
function PhantomReaperPage({ projects, terminateProject, totalReclaimedCost }) {
  const activeCount = projects.filter(p => !p.reaped).length

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">👻 Phantom Infrastructure Auto-Reaper</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Auto-detects and terminates running development databases and virtual servers tied to physical jobsites that are already completed.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Topology Mapping Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Physical-Virtual Bridge Topology</h3>
            <p className="text-xs text-slate-400">
              Completed building sites leaking virtual resources.
            </p>
          </div>

          <div className="relative border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex items-center justify-center min-h-[300px] overflow-hidden">
            <svg className="w-full max-w-md h-60" viewBox="0 0 400 240">
              {/* Construction Jobsite Nodes */}
              <g transform="translate(60, 120)">
                <rect x="-35" y="-20" width="70" height="40" rx="8" fill="#fda4af" fillOpacity="0.2" stroke="#fb7185" strokeWidth="1.5" />
                <text x="0" y="2" fill="#334155" fontSize="10" fontWeight="bold" textAnchor="middle">Jobsite A</text>
                <text x="0" y="14" fill="#64748b" fontSize="7" opacity="0.8" textAnchor="middle">Completed</text>
                <circle cx="0" cy="-20" r="4" fill="#fb7185" className="active-pulse" />
              </g>

              <g transform="translate(60, 40)">
                <rect x="-35" y="-20" width="70" height="40" rx="8" fill="#5eead4" fillOpacity="0.2" stroke="#2dd4bf" strokeWidth="1.5" />
                <text x="0" y="2" fill="#334155" fontSize="10" fontWeight="bold" textAnchor="middle">Jobsite B</text>
                <text x="0" y="14" fill="#64748b" fontSize="7" opacity="0.8" textAnchor="middle">Active Shift</text>
              </g>

              {/* Central Shield Gateway */}
              <g transform="translate(200, 80)">
                <circle cx="0" cy="0" r="28" fill="#f8fafc" stroke="#a78bfa" strokeWidth="2" />
                <path d="M-8,-8 L8,-8 L8,0 C8,6 0,12 -8,12 L-8,0 Z" fill="none" stroke="#a78bfa" strokeWidth="1.5" transform="scale(0.8)" />
                <text x="0" y="18" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle" transform="translate(0, 12)">AUTO-REAPER</text>
              </g>

              {/* Virtual Server Nodes */}
              <g transform="translate(320, 50)">
                <rect x="-35" y="-15" width="70" height="30" rx="6" fill="#f8fafc" stroke={activeCount > 0 ? '#fb7185' : '#cbd5e1'} strokeWidth="1.5" />
                <text x="0" y="2" fill="#334155" fontSize="9" textAnchor="middle">AWS-EC2</text>
                <text x="0" y="11" fill={activeCount > 0 ? '#fb7185' : '#94a3b8'} fontSize="7" textAnchor="middle">
                  {activeCount > 0 ? 'Leaking' : 'Terminated'}
                </text>
              </g>

              <g transform="translate(320, 120)">
                <rect x="-35" y="-15" width="70" height="30" rx="6" fill="#f8fafc" stroke={activeCount > 0 ? '#fb7185' : '#cbd5e1'} strokeWidth="1.5" />
                <text x="0" y="2" fill="#334155" fontSize="9" textAnchor="middle">AWS-RDS</text>
                <text x="0" y="11" fill={activeCount > 0 ? '#fb7185' : '#94a3b8'} fontSize="7" textAnchor="middle">
                  {activeCount > 0 ? 'Leaking' : 'Terminated'}
                </text>
              </g>

              {/* Connections (Leaking) */}
              {activeCount > 0 ? (
                <>
                  <path d="M 95 120 Q 200 120 200 108" fill="none" stroke="#fb7185" strokeWidth="1.5" strokeDasharray="4,4" className="animate-marquee" />
                  <path d="M 228 80 Q 280 50 285 50" fill="none" stroke="#fb7185" strokeWidth="1.5" strokeDasharray="4,4" />
                  <path d="M 228 80 Q 280 120 285 120" fill="none" stroke="#fb7185" strokeWidth="1.5" strokeDasharray="4,4" />
                </>
              ) : (
                <>
                  <path d="M 95 120 Q 200 120 200 108" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                  <path d="M 228 80 Q 280 50 285 50" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                  <path d="M 228 80 Q 280 120 285 120" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                </>
              )}
            </svg>

            {activeCount === 0 && (
              <div className="absolute inset-0 bg-teal-50/80 backdrop-blur-xs flex items-center justify-center p-6 border border-teal-200 rounded-xl animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-teal-400 text-white rounded-full flex items-center justify-center mx-auto shadow-sm shadow-teal-200">
                    <IconCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-teal-600">All Completed Systems Cleared</h4>
                  <p className="text-xs text-slate-500">Carbon leaks sealed. Recovered cost: ${totalReclaimedCost.toFixed(2)}/day.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leakage details and termination triggers */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Unlinked Server Registries</h3>
            <p className="text-xs text-slate-400">
              Completed building projects still mapped to live VPC server databases.
            </p>
          </div>

          <div className="space-y-4">
            {projects.map(project => (
              <div
                key={project.id}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  project.reaped
                    ? 'bg-teal-50 border-teal-100 opacity-70'
                    : 'bg-rose-50 border-rose-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">{project.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Archived Project Node</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                    project.reaped ? 'bg-teal-100 text-teal-600 border border-teal-200' : 'bg-rose-100 text-rose-500 border border-rose-200'
                  }`}>
                    {project.reaped ? 'RECLAIMED' : 'UNSAFE GHOST LEAK'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 mb-3 space-y-1">
                  <p>Resources leaked: <strong className="font-semibold text-slate-600">{project.resources.join(', ')}</strong></p>
                  <p className="flex justify-between">
                    <span>Leaking Cost Rate:</span>
                    <strong className="text-slate-700">${project.cost.toFixed(2)}/day</strong>
                  </p>
                  <p className="flex justify-between">
                    <span>Leaking Carbon Output:</span>
                    <strong className="text-slate-700">{project.co2} kg CO2/day</strong>
                  </p>
                </div>

                {project.reaped ? (
                  <div className="flex items-center justify-center gap-2 p-2 bg-teal-50 border border-teal-100 text-teal-500 rounded-xl text-xs font-semibold">
                    <IconCheck className="w-4 h-4" />
                    <span>Resources Reclaimed. Carbon leak sealed.</span>
                  </div>
                ) : (
                  <button
                    onClick={() => terminateProject(project.id, project.name)}
                    className="w-full bg-rose-400 hover:bg-rose-500 text-white font-bold py-2.5 px-3 rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-rose-200"
                  >
                    <span>TERMINATE & RECLAIM</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------
 * 6. "CHAOS & CURE" AI DEMO ENGINE PAGE
 * ------------------------------------------------------------- */
function ChaosCurePage({ cureResolved, setCureResolved, triggerToast }) {
  const [demoState, setDemoState] = useState(() => localStorage.getItem('demo_state') || 'idle')
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('demo_logs')
    return saved ? JSON.parse(saved) : ['[*] System secure. Zero-Agent telemetry active.']
  })
  const [running, setRunning] = useState(() => {
    return localStorage.getItem('demo_running') === 'true'
  })

  const [telemetry, setTelemetry] = useState(() => {
    const base = []
    for (let i = 0; i < 15; i++) {
      base.push({ time: i, cpu: 8 + Math.random() * 4, network: 12 + Math.random() * 5, memory: 34 + Math.random() * 2 })
    }
    return base
  })

  const logRef = useRef(null)

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  const updateDemoState = (nextState, nextLogs, nextRunning) => {
    setDemoState(nextState)
    setLogs(nextLogs)
    setRunning(nextRunning)
    localStorage.setItem('demo_state', nextState)
    localStorage.setItem('demo_logs', JSON.stringify(nextLogs))
    localStorage.setItem('demo_running', String(nextRunning))
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => {
        const next = [...prev.slice(1)]
        const lastEl = prev[prev.length - 1]
        const index = lastEl ? lastEl.time + 1 : 0
        
        let cpu = 8 + Math.random() * 4
        let network = 12 + Math.random() * 5
        let memory = 34 + Math.random() * 2

        if (demoState === 'attack') {
          cpu = 95 + Math.random() * 4
          network = 890 + Math.random() * 80
          memory = 91 + Math.random() * 3
        } else if (demoState === 'mitigate') {
          cpu = 48 + Math.random() * 8
          network = 42 + Math.random() * 10
          memory = 72 + Math.random() * 4
        } else if (demoState === 'secure') {
          cpu = 7 + Math.random() * 2
          network = 15 + Math.random() * 4
          memory = 35 + Math.random() * 1
        }

        next.push({ time: index, cpu, network, memory })
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [demoState])

  const addLogMessage = (msg) => {
    setLogs(prev => {
      const next = [...prev, msg]
      localStorage.setItem('demo_logs', JSON.stringify(next))
      return next
    })
  }

  const runSimulation = () => {
    if (running) return
    setCureResolved(false)
    localStorage.setItem('cureResolved', 'false')
    
    updateDemoState('idle', ['[*] Initiating Zero-Day exploit scenario simulation...'], true)
    
    setTimeout(() => {
      updateDemoState('attack', [
        '[*] Initiating Zero-Day exploit scenario simulation...',
        '[!] ALERT: Cryptojacking container detected in cluster node VPC-A1.',
        '[!] ALERT: CPU workload spiked to 98% (Cryptominer daemon detected).',
        '[!] ALERT: Massive outbound data packets transfer detected (exfiltration path: 185.220.101.4).',
        '[!] WARNING: Severe Baseline Energy spike (+450% baseline cost).'
      ], true)
      triggerToast("CRITICAL: Unauthorized cloud container exploit detected!", "warning")
    }, 1500)

    setTimeout(() => {
      setDemoState('mitigate')
      localStorage.setItem('demo_state', 'mitigate')
      addLogMessage('[*] ENGAGING: BuildShield Autonomous AI Security Agent.')
      addLogMessage('[*] EXECUTING: Isolating compromised container cluster (sandbox lock).')
      addLogMessage('[*] EXECUTING: Revoking temporary subcontractor session API tokens.')
      addLogMessage('[*] EXECUTING: Rerouting traffic into virtual blackhole endpoint.')
      triggerToast("AI Agent Engaged: Isolating threat vectors...", "info")
    }, 5500)

    setTimeout(() => {
      updateDemoState('secure', [
        '[*] Initiating Zero-Day exploit scenario simulation...',
        '[!] ALERT: Cryptojacking container detected in cluster node VPC-A1.',
        '[!] ALERT: CPU workload spiked to 98% (Cryptominer daemon detected).',
        '[!] ALERT: Massive outbound data packets transfer detected (exfiltration path: 185.220.101.4).',
        '[!] WARNING: Severe Baseline Energy spike (+450% baseline cost).',
        '[*] ENGAGING: BuildShield Autonomous AI Security Agent.',
        '[*] EXECUTING: Isolating compromised container cluster (sandbox lock).',
        '[*] EXECUTING: Revoking temporary subcontractor session API tokens.',
        '[*] EXECUTING: Rerouting traffic into virtual blackhole endpoint.',
        '[+] CONTAINMENT: Exploit source sandbox shutdown completed.',
        '[+] PROTECTION: Container patch successfully deployed.',
        '[+] SUCCESS: Telemetry normalized. Cloud platform fully secured.'
      ], false)
      setCureResolved(true)
      localStorage.setItem('cureResolved', 'true')
      
      triggerToast("Incident resolved. Workloads secured and carbon rates normalized.", "success")
    }, 10500)
  }

  const resetSystem = () => {
    updateDemoState('idle', ['[*] System reset. Telemetry normal.'], false)
    setCureResolved(true)
    localStorage.setItem('cureResolved', 'true')
    triggerToast("System metrics reset to standard baseline.", "info")
  }

  const terminalTheme = 
    demoState === 'attack' ? 'text-rose-500 border-rose-200 bg-rose-50/50' :
    demoState === 'mitigate' ? 'text-orange-500 border-orange-200 bg-orange-50/50' :
    demoState === 'secure' ? 'text-teal-500 border-teal-200 bg-teal-50/50' :
    'text-slate-500 border-slate-200 bg-slate-50/50'

  const currentCpu = telemetry[telemetry.length - 1]?.cpu || 0
  const currentNet = telemetry[telemetry.length - 1]?.network || 0
  const currentMem = telemetry[telemetry.length - 1]?.memory || 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight">⚡ The "Chaos & Cure" AI Demo Engine</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Simulates a live security vulnerability exploit (Chaos) and demonstrates the platform autonomously resolving the threat (Cure).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={runSimulation}
            disabled={running}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition ${
              running
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-rose-400 hover:bg-rose-500 text-white shadow-rose-200 active-pulse'
            }`}
          >
            {running ? 'Demo Processing...' : 'Simulate Zero-Day Exploit'}
          </button>
          
          <button
            onClick={resetSystem}
            disabled={running}
            className="p-2.5 border border-slate-200 bg-white/80 hover:bg-slate-50 rounded-xl text-slate-400 transition"
            title="Reset system baseline"
          >
            <IconRefresh className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Console Log */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="flex items-center justify-between px-4 py-3 bg-white/80 border border-b-0 border-slate-200 rounded-t-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="w-3 h-3 rounded-full bg-teal-400" />
              <span className="text-xs font-mono text-slate-400 ml-2">cyber-incident-sandbox-terminal</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                demoState === 'attack' ? 'bg-rose-400 active-pulse' :
                demoState === 'mitigate' ? 'bg-orange-400 active-pulse' :
                demoState === 'secure' ? 'bg-teal-400' :
                'bg-slate-300'
              }`} />
              <span className="text-[10px] font-mono uppercase text-slate-400">
                State: {demoState}
              </span>
            </div>
          </div>

          <div
            ref={logRef}
            className={`terminal-window border border-t-0 rounded-b-2xl p-5 h-80 overflow-y-auto backdrop-blur-md shadow-sm ${terminalTheme}`}
          >
            <div className="terminal-scanline opacity-10" />
            <div className="space-y-1.5 font-mono text-xs relative z-10">
              {logs.map((log, index) => (
                <div key={index} className="leading-relaxed font-medium">
                  {log}
                </div>
              ))}
              {running && (
                <div className="flex items-center gap-1.5 opacity-60 animate-pulse mt-3">
                  <span className="w-1.5 h-3 bg-current" />
                  <span>AI Agent processing logs...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Telemetry KPI Panel */}
        <div className="p-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Autonomous Telemetry</h3>
            <p className="text-xs text-slate-400">
              Live updates of network traffic and virtualization hardware load.
            </p>
          </div>

          {/* Area charts showing CPU spike */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">VM CPU Load (%)</span>
                <span className={`font-mono ${demoState === 'attack' ? 'text-rose-500 font-bold' : 'text-slate-600'}`}>
                  {currentCpu.toFixed(1)}%
                </span>
              </div>
              <div className="h-20 bg-slate-50/50 rounded-lg overflow-hidden border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetry} margin={{ top: 2, right: 0, left: -40, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={demoState === 'attack' ? '#fb7185' : '#60a5fa'} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={demoState === 'attack' ? '#fb7185' : '#60a5fa'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="cpu" stroke={demoState === 'attack' ? '#fb7185' : '#93c5fd'} strokeWidth={1.5} fillOpacity={1} fill="url(#cpuGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500">Network Packets (Mb/s)</span>
                <span className={`font-mono ${demoState === 'attack' ? 'text-rose-500 font-bold' : 'text-slate-600'}`}>
                  {currentNet.toFixed(0)} Mb/s
                </span>
              </div>
              <div className="h-20 bg-slate-50/50 rounded-lg overflow-hidden border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetry} margin={{ top: 2, right: 0, left: -40, bottom: 0 }}>
                    <defs>
                      <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={demoState === 'attack' ? '#fb7185' : '#a78bfa'} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={demoState === 'attack' ? '#fb7185' : '#a78bfa'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="network" stroke={demoState === 'attack' ? '#fb7185' : '#c4b5fd'} strokeWidth={1.5} fillOpacity={1} fill="url(#netGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between gap-1 text-[10px] uppercase font-bold text-slate-400 border-t border-slate-100">
            <span>RAM: {currentMem.toFixed(1)}%</span>
            <span>VPC Node: US-EAST-1</span>
          </div>
        </div>
      </div>
    </div>
  )
}