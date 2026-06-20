BuildShield NEXUSOP: Product 
Requirements Document 
�
�
Project Context 
Hackathon Target: Hilti Track 2 - Secure & Energy-Aware Cloud Platforms for Construction 
Tech. 
Core Concept: A cloud optimization platform that bridges the gap between physical 
construction lifecycles and cloud infrastructure. It continuously monitors for vulnerabilities and 
carbon-intensive workloads by linking cloud servers directly to jobsite realities (shift hours, 
contractor phases, project completions). 
�
�
Global Tech Stack 
● Frontend: React (Vite), Tailwind CSS, Lucide Icons, Recharts (for data visualization). 
● Backend / Database: Firebase (Firestore, Auth). 
● Design System: Clean, modern, light-theme dashboard with slate, sky blue, and emerald 
accents. Extensive use of flexbox/grid for card layouts. 
�
�
Feature 1: Jobsite "Lights Out" Protocol (Shift 
Scheduler) 
Concept: A system that automaticaly pauses non-critical cloud resources (staging servers, 
sync tasks) when physical construction workers go home, shrinking the attack surface and 
cutting baseline energy waste. 
Frontend Specifications: 
● UI Component: A card titled "Jobsite hours → cloud uptime". 
● Interactions: Two dropdowns/selectors for shiftStart (e.g., 07:00) and shiftEnd (e.g., 
17:00). 
● Visualization: A dynamic 24-hour bar chart. Hours inside the shift are tal, active blue bars. 
Off-hours are short, inactive gray bars. 
● Live Metrics: * Energy Saved: (24 - active_hours) * 22 kWh and * 2.9 kg CO2. 
○ Attack Surface Reduction: Percentage of the day the servers are offline. 
● Actions: "Sync Calendar" button to save settings to Firebase. 
Backend & Database (Firestore) Specifications: 
● Collection: artifacts/{appId}/public/data/lightsOut/schedule 
● Data Model: { shiftStart: Number, shiftEnd: Number, updatedAt: Timestamp } 
● Logic: Frontend listens via onSnapshot to update in real-time if another manager changes 
the schedule. 
�
�
Feature 2: Phantom Infrastructure Auto-Reaper 
Concept: Detects and reclaims cloud resources (databases, VMs) that are stil running and 
costing money/carbon even though their linked physical construction project is marked 
"Completed". 
Frontend Specifications: 
● UI Component: A card titled "Phantom Auto-Reaper". 
● Alert State: Shows a warning for an archived project (e.g., "Riverside Tower Phase 1"). 
Displays leaked resources (e.g., "1x RDS Database, 2x EC2") and daily cost/carbon leakage. 
● Actions: A bold "TERMINATE & RECLAIM" button. 
● Success State: Changes to a green success UI confirming "Resources Reclaimed. Carbon 
leak sealed." 
Backend & Database (Firestore) Specifications: 
● Collection: artifacts/{appId}/public/data/phantomResources/status 
● Data Model: { projectId: String, projectName: String, leakedCost: Number, isReaped: 
Boolean } 
● Logic: When "Terminate" is clicked, update isReaped to true. 
�
�
Feature 3: Dynamic Subcontractor Trust Scoring 
Concept: Automaticaly assigns a live IAM risk score to subcontractors based on their data 
downloads and project phase. Auto-revokes cloud access when their contract ends. 
Frontend Specifications: 
● UI Component: A list/table view titled "Subcontractor Trust". 
● Data Rows: * Subcontractor Name (e.g., "Apex Plumbing") 
○ Project Phase ("Active", "Completed") 
○ Trust Score (Progress bar: 0-100. Green > 80, Yelow 50-80, Red < 50) 
○ Access Status Pil ("Granted", "Warning", "Revoked") 
Backend & Database (Firestore) Specifications: 
● Collection: artifacts/{appId}/public/data/subcontractors/list 
● Data Model: Array of objects [{ id, name, phase, score, accessStatus }] 
● Logic: Agent should build a listener that puls this array and maps it to the UI. If phase === 
'Completed', access must strictly reflect 'Revoked'. 
�
�
Feature 4: The Carbon & Security Debt Clock 
Concept: A ticking, gamified metric that calculates ongoing carbon emissions and financial 
cost generated specificaly by unoptimized workloads and unpatched vulnerabilities. 
Frontend Specifications: 
● UI Component: A prominent digital clock/counter at the top of the dashboard. 
● Visualization: Ticking numbers showing "Carbon Debt (kg CO2)" and "Financial Waste ($)". 
● Animation: Use setInterval or requestAnimationFrame to make the numbers visualy 
increase every second. 
● Interaction: If the "Lights Out" protocol is activated or the "Chaos & Cure" is resolved, the 
speed of the ticking clock drastica ly slows down. 
Backend & Database (Firestore) Specifications: 
● Collection: artifacts/{appId}/public/data/debtMetrics/current 
● Data Model: { baseDebt: Number, tickRate: Number } 
● Logic: The frontend calculates: currentDebt = baseDebt + (timeElapsed * tickRate). 
Changing systemic settings updates the tickRate in the database. 
�
�
Feature 5: The "Chaos & Cure" AI Demo Engine 
Concept: A presentation tool for the hackathon pitch. Simulates a live cyber attack (Chaos) 
and shows the platform autonomously mitigating it (Cure) without human intervention. 
Frontend Specifications: 
● UI Component: A dark-themed terminal/console window inside a card. 
● States: 
1. Idle: "System secure." 
2. Attack (Red, Pulse): "[!] CRITICAL: CPU Spike 98%. Cryptojacking detected." 
3. Mitigate (Yelow): "[*] AI Agent Engaged: Isolating container..." 
4. Secure (Green): "[+] Patch deployed. Energy normalized." 
● Actions: A "SIMULATE ZERO-DAY EXPLOIT" button that triggers the sequence via 
setTimeout chains. 
Backend (Simulated logic for AI Agent) Specifications: 
● Architecture: The agent should build this primarily using React state transitions 
(demoState). 
● Extension: Instruct the AI to optionaly log these event transitions into a Firestore 
auditLogs colection to simulate real backend event processing. 
⚙
AI Agent Coding Instructions (Critical Rules) 
1. Single File Mandate: Al React code MUST be contained in a single App.jsx file. Do not split 
components into separate files. 
2. Tailwind Classes: Use standard Tailwind CSS classes for al styling. 
3. Firebase Guardrails: Always verify isFirebaseReady and wrap Firestore cals in try/catch. 
Fa l back to local state UI if Firebase fails to initialize. 
4. Icons: Use inline SVGs instead of external icon libraries (like lucide-react) to prevent 
bundler mismatch errors in isolated environments. 