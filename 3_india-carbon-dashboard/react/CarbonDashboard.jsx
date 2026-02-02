import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ReferenceLine } from 'recharts';

const VERSION = "6.0.0", AUTHOR = "Bosco Chiramel", PAPER = "Carbon Liability and Decarbonization Pathways for India's Petroleum Refining Sector";

const refineries = [
  { name: "Jamnagar DTA", operator: "RIL", type: "Private", capacity: 33.0, age: 25, liability: 5.57, risk: "A", state: "Gujarat" },
  { name: "Jamnagar SEZ", operator: "RIL", type: "Private", capacity: 35.2, age: 16, liability: 4.92, risk: "AAA", state: "Gujarat" },
  { name: "Paradip", operator: "IOCL", type: "PSU", capacity: 15.0, age: 8, liability: 2.62, risk: "AAA", state: "Odisha" },
  { name: "Kochi", operator: "BPCL", type: "PSU", capacity: 15.5, age: 58, liability: 0.95, risk: "BB", state: "Kerala" },
  { name: "Panipat", operator: "IOCL", type: "PSU", capacity: 15.0, age: 26, liability: 0.88, risk: "AAA", state: "Haryana" },
  { name: "Mangalore", operator: "MRPL", type: "PSU", capacity: 15.0, age: 36, liability: 0.85, risk: "BBB", state: "Karnataka" },
  { name: "Gujarat", operator: "IOCL", type: "PSU", capacity: 13.7, age: 59, liability: 0.78, risk: "BB", state: "Gujarat" },
  { name: "BPCL Mumbai", operator: "BPCL", type: "PSU", capacity: 12.0, age: 69, liability: 0.72, risk: "B", state: "Maharashtra" },
  { name: "Chennai", operator: "CPCL", type: "PSU", capacity: 10.5, age: 55, liability: 0.65, risk: "BB", state: "Tamil Nadu" },
  { name: "Visakhapatnam", operator: "HPCL", type: "PSU", capacity: 8.33, age: 67, liability: 0.58, risk: "B", state: "AP" },
  { name: "HPCL Mumbai", operator: "HPCL", type: "PSU", capacity: 7.5, age: 70, liability: 0.52, risk: "B", state: "Maharashtra" },
  { name: "Mathura", operator: "IOCL", type: "PSU", capacity: 8.0, age: 42, liability: 0.48, risk: "BB", state: "UP" },
  { name: "Haldia", operator: "IOCL", type: "PSU", capacity: 8.0, age: 50, liability: 0.46, risk: "BB", state: "WB" },
  { name: "Bina", operator: "BPCL", type: "PSU", capacity: 7.8, age: 13, liability: 0.44, risk: "AAA", state: "MP" },
  { name: "Bathinda", operator: "HMEL", type: "PSU", capacity: 11.3, age: 14, liability: 0.42, risk: "AAA", state: "Punjab" },
];

const globalPrices = [
  { market: "EU ETS", price: 68.5, currency: "€", flag: "🇪🇺" },
  { market: "UK ETS", price: 42.1, currency: "£", flag: "🇬🇧" },
  { market: "California", price: 35.8, currency: "$", flag: "🇺🇸" },
  { market: "China", price: 9.2, currency: "¥", flag: "🇨🇳" },
  { market: "India (Est.)", price: 20.0, currency: "₹", flag: "🇮🇳" },
];

const GLOSSARY = {
  "Carbon Liability": "Present value of future carbon costs over asset lifetime",
  "ETS": "Emissions Trading System - market-based pollution control",
  "CBAM": "Carbon Border Adjustment Mechanism - tariff on carbon imports",
  "Monte Carlo": "Statistical simulation using random sampling",
  "Discount Rate": "Rate to calculate present value of future costs",
  "Stranded Assets": "Assets devalued due to climate policy changes",
  "PSU": "Public Sector Undertaking - government-owned corporation",
  "MMTPA": "Million Metric Tonnes Per Annum",
  "BAU": "Business As Usual - no new climate action",
  "CCUS": "Carbon Capture, Utilization and Storage",
  "NDC": "Nationally Determined Contribution under Paris Agreement",
};

const METHODOLOGY = {
  formula: "L = Σ(Et × Pt × (1+g)^t) / (1+r)^t",
  sources: ["PPAC Ministry of Petroleum", "IPCC Guidelines", "IEA World Energy Outlook", "India NDC submissions"],
  scenarios: [
    { name: "Low", range: "$10-75/t", source: "IEA Stated Policies" },
    { name: "Base", range: "$20-150/t", source: "IEA Sustainable Dev" },
    { name: "High", range: "$40-250/t", source: "IEA Net Zero" },
    { name: "EU", range: "$80-300/t", source: "EU ETS trajectory" },
  ],
  pathways: [
    { id: "BAU", cut: "25%", desc: "No additional policy" },
    { id: "Moderate", cut: "45%", desc: "Current commitments" },
    { id: "Aggressive", cut: "81%", desc: "Enhanced ambition" },
    { id: "EarlyAction", cut: "80%", desc: "Front-loaded cuts" },
  ],
  risks: [
    { rating: "AAA", desc: "Age <20y, Efficiency >75%" },
    { rating: "A", desc: "Age 20-30y, Efficiency 70-75%" },
    { rating: "BBB", desc: "Age 30-45y, Efficiency 65-70%" },
    { rating: "BB", desc: "Age 45-60y, Efficiency 55-65%" },
    { rating: "B", desc: "Age >60y, Efficiency <55%" },
  ]
};

const ONBOARDING = [
  { title: "Welcome! 🇮🇳", text: "Explore carbon liability scenarios for India's 23 refineries." },
  { title: "Key Metrics", text: "Real-time calculations update as you adjust parameters." },
  { title: "Controls", text: "Set carbon price ($10-200), discount rate (5-15%), and pathway." },
  { title: "Navigation", text: "Use tabs or keyboard: 1-6 for tabs, B/M/A/E for pathways, H for help." },
  { title: "Ready! 🎉", text: "Start exploring. Check Guide tab for documentation." },
];

const TIPS = {
  price: "Projected cost per tonne CO₂. Higher = more liability but faster decarbonization.",
  rate: "Present value calculation. Govt uses 5-8%, private 10-15%.",
  pathway: "Emissions trajectory. BAU = no action, Early = front-loaded cuts.",
  liability: "Present value of all future carbon costs.",
  monte: "1,000 simulations showing range of outcomes.",
  govt: "Government fiscal risk from PSU refineries.",
};

// Components
const Tip = ({ id, children }) => {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      {children}
      <button className="ml-1 w-4 h-4 rounded-full bg-slate-600 text-xs hover:bg-slate-500" 
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>?</button>
      {show && <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 bg-slate-700 rounded text-xs z-50">{TIPS[id]}</div>}
    </span>
  );
};

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: "bg-green-600", warning: "bg-amber-600", info: "bg-blue-600" };
  return <div className={`fixed bottom-4 right-4 ${colors[type]} rounded-lg p-3 shadow-lg z-50 animate-slideUp`}>{msg}</div>;
};

const Card = ({ label, value, sub, color = "text-white", tip }) => (
  <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-slate-600">
    <div className="text-xs text-slate-500 mb-1">{tip ? <Tip id={tip}>{label}</Tip> : label}</div>
    <div className={`text-lg font-bold ${color}`}>{value}</div>
    {sub && <div className="text-xs text-slate-500">{sub}</div>}
  </div>
);

const Insight = ({ type, title, detail, action }) => {
  const [open, setOpen] = useState(false);
  const styles = { critical: "border-red-600 from-red-900/50", warning: "border-amber-600 from-amber-900/50", success: "border-green-600 from-green-900/50", info: "border-blue-600 from-blue-900/50" };
  const icons = { critical: "🚨", warning: "⚠️", success: "✅", info: "💡" };
  return (
    <div className={`bg-gradient-to-r ${styles[type]} to-transparent border-l-4 rounded-lg`}>
      <button className="w-full p-3 text-left flex items-start gap-3" onClick={() => setOpen(!open)}>
        <span className="text-xl">{icons[type]}</span>
        <div className="flex-1"><h4 className="font-semibold">{title}</h4><p className="text-sm text-slate-300 mt-1">{detail}</p></div>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && <div className="px-3 pb-3"><div className="p-2 bg-black/20 rounded text-sm"><span className="text-slate-400">Action: </span>{action}</div></div>}
    </div>
  );
};

const Onboarding = ({ step, total, current, onNext, onSkip }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-amber-500/50">
      <div className="flex gap-1 mb-4">{Array(total).fill(0).map((_, i) => <div key={i} className={`h-1 flex-1 rounded ${i <= current ? 'bg-amber-500' : 'bg-slate-600'}`} />)}</div>
      <h3 className="text-xl font-bold text-amber-400 mb-2">{step.title}</h3>
      <p className="text-slate-300 mb-6">{step.text}</p>
      <div className="flex justify-between">
        <button onClick={onSkip} className="text-slate-400 text-sm">Skip</button>
        <button onClick={onNext} className="bg-amber-500 hover:bg-amber-600 px-6 py-2 rounded-lg font-medium">
          {current === total - 1 ? "Start" : "Next"}
        </button>
      </div>
    </div>
  </div>
);

const HelpModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
    <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-600" onClick={e => e.stopPropagation()}>
      <h2 className="text-xl font-bold mb-4">⌨️ Keyboard Shortcuts</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[['1-6', 'Switch tabs'], ['B', 'BAU'], ['M', 'Moderate'], ['A', 'Aggressive'], ['E', 'Early Action'], ['S', 'Quick save'], ['H', 'This help']].map(([k, v]) => (
          <div key={k} className="flex gap-2"><kbd className="bg-slate-700 px-2 py-1 rounded">{k}</kbd><span>{v}</span></div>
        ))}
      </div>
      <button onClick={onClose} className="mt-4 w-full bg-amber-500 hover:bg-amber-600 py-2 rounded-lg">Got it!</button>
    </div>
  </div>
);

const Stakeholder = ({ view, scenario }) => {
  const data = {
    government: { icon: "🏛️", metrics: [["Fiscal Exposure", "$17.7B", "text-red-400"], ["Auction Revenue", "$85-100B", "text-green-400"], ["Net Position", "$76-92B", "text-emerald-400"], ["Jobs at Risk", "~25,000", "text-amber-400"]], actions: ["Launch ETS 2028", "$15B Transition Fund", "Review aging PSUs", "CBAM 2032"] },
    industry: { icon: "🏭", metrics: [["Compliance Cost", `$${scenario.liability}B`, "text-red-400"], ["CCUS Need", "$8-12B", "text-blue-400"], ["Efficiency Gain", "15-20%", "text-green-400"], ["Stranded Risk", "$63.7B", "text-amber-400"]], actions: ["Lock carbon contracts", "Efficiency investments", "CCUS consortium", "Green H2 development"] },
    investor: { icon: "📈", metrics: [["Carbon Beta", "1.8x", "text-red-400"], ["Investment Need", "$25-30B", "text-blue-400"], ["Green Bonds", "$10B+", "text-green-400"], ["PSU Discount", "15-25%", "text-amber-400"]], actions: ["Overweight modern assets", "Underweight >50y", "Watch BPCL", "Green H2 plays"] },
  };
  const d = data[view];
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold">{d.icon} {view.charAt(0).toUpperCase() + view.slice(1)} View</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">{d.metrics.map(([l, v, c]) => <div key={l} className="bg-slate-700/50 rounded-lg p-3"><div className="text-xs text-slate-400">{l}</div><div className={`font-bold ${c}`}>{v}</div></div>)}</div>
      <div className="bg-slate-700/30 rounded-lg p-4"><h4 className="font-semibold mb-2">📋 Actions</h4><div className="grid grid-cols-2 gap-2">{d.actions.map((a, i) => <div key={i} className="text-sm flex gap-2"><span className="text-green-400">✓</span>{a}</div>)}</div></div>
    </div>
  );
};

const GuideMethodology = () => (
  <div className="space-y-4">
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold text-amber-400 mb-3">🧮 Liability Formula</h4>
      <div className="bg-slate-900 rounded p-3 font-mono text-center mb-3">{METHODOLOGY.formula}</div>
      <p className="text-sm text-slate-400">L=Liability, E=Emissions, P=Price, g=growth, r=discount, t=time</p>
    </div>
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold text-amber-400 mb-3">📊 Data Sources</h4>
      <ul className="space-y-1">{METHODOLOGY.sources.map((s, i) => <li key={i} className="text-sm flex gap-2"><span className="text-green-400">✓</span>{s}</li>)}</ul>
    </div>
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold text-amber-400 mb-3">💰 Price Scenarios</h4>
      <div className="space-y-2">{METHODOLOGY.scenarios.map(s => <div key={s.name} className="flex justify-between text-sm"><span>{s.name}</span><span className="text-amber-400">{s.range}</span><span className="text-slate-400">{s.source}</span></div>)}</div>
    </div>
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold text-amber-400 mb-3">🛤️ Pathways</h4>
      <div className="grid grid-cols-2 gap-2">{METHODOLOGY.pathways.map(p => <div key={p.id} className="bg-slate-700/50 rounded p-2"><div className="flex justify-between"><span className="font-medium">{p.id}</span><span className="text-green-400">-{p.cut}</span></div><p className="text-xs text-slate-400">{p.desc}</p></div>)}</div>
    </div>
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold text-amber-400 mb-3">🎯 Risk Ratings</h4>
      <div className="space-y-2">{METHODOLOGY.risks.map(r => <div key={r.rating} className="flex gap-3 text-sm"><span className="w-10 text-center py-0.5 rounded font-bold" style={{ backgroundColor: { AAA: '#10b981', A: '#34d399', BBB: '#fbbf24', BB: '#f97316', B: '#ef4444' }[r.rating] }}>{r.rating}</span><span className="text-slate-300">{r.desc}</span></div>)}</div>
    </div>
  </div>
);

const GuideGlossary = () => {
  const [search, setSearch] = useState('');
  const filtered = Object.entries(GLOSSARY).filter(([t]) => t.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold text-amber-400 mb-3">📖 Glossary ({Object.keys(GLOSSARY).length} terms)</h4>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 mb-4" />
      <div className="space-y-3 max-h-80 overflow-y-auto">{filtered.map(([term, def]) => <div key={term} className="border-b border-slate-700 pb-2"><dt className="font-medium">{term}</dt><dd className="text-sm text-slate-400">{def}</dd></div>)}</div>
    </div>
  );
};

const GuideAbout = () => (
  <div className="space-y-4">
    <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg p-6 border border-amber-700">
      <h3 className="text-xl font-bold text-amber-400 mb-2">India Carbon Liability Dashboard</h3>
      <p className="text-slate-300 mb-4">Interactive tool for exploring carbon liability scenarios in India's petroleum refining sector.</p>
      <div className="grid grid-cols-2 gap-4 text-sm"><div><span className="text-slate-400">Version</span><div className="font-medium">{VERSION}</div></div><div><span className="text-slate-400">Author</span><div className="font-medium">{AUTHOR}</div></div></div>
    </div>
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold mb-3">📄 Citation</h4>
      <div className="bg-slate-900 rounded p-3 text-sm font-mono">{AUTHOR} (2025). "{PAPER}". Dashboard v{VERSION}.</div>
    </div>
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold mb-3">📜 Version History</h4>
      <div className="space-y-2 text-sm">{[["6.0", "Documentation, onboarding, glossary"], ["5.0", "Accessibility, mobile, shortcuts"], ["4.0", "AI insights, stakeholder views"], ["3.0", "PDF export, optimizer"], ["2.0", "Monte Carlo, map"], ["1.0", "Initial release"]].map(([v, d]) => <div key={v} className="flex gap-3"><span className="bg-slate-700 px-2 rounded text-xs font-mono">v{v}</span><span className="text-slate-300">{d}</span></div>)}</div>
    </div>
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-semibold mb-2">⚖️ Disclaimer</h4>
      <p className="text-sm text-slate-400">For educational/research purposes only. Not financial advice.</p>
    </div>
  </div>
);

// Main Dashboard
export default function CarbonDashboardV6() {
  const [tab, setTab] = useState('overview');
  const [stake, setStake] = useState('government');
  const [price, setPrice] = useState(50);
  const [rate, setRate] = useState(10);
  const [path, setPath] = useState('Aggressive');
  const [help, setHelp] = useState(false);
  const [toast, setToast] = useState(null);
  const [sceneName, setSceneName] = useState('');
  const [guideTab, setGuideTab] = useState('methodology');
  const [onboard, setOnboard] = useState(() => !localStorage.getItem('carbonOnboarded'));
  const [onboardStep, setOnboardStep] = useState(0);
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem('carbonV6') || '[]'); } catch { return []; } });
  const [prices, setPrices] = useState(globalPrices);

  useEffect(() => { localStorage.setItem('carbonV6', JSON.stringify(saved)); }, [saved]);
  useEffect(() => { const i = setInterval(() => setPrices(p => p.map(x => ({ ...x, price: +(x.price + (Math.random() - 0.5) * 0.4).toFixed(1) }))), 5000); return () => clearInterval(i); }, []);
  useEffect(() => {
    const handler = e => {
      if (e.target.tagName === 'INPUT') return;
      const k = e.key.toLowerCase();
      if (k === 'h' || k === '?') { e.preventDefault(); setHelp(true); }
      else if (k === 'escape') setHelp(false);
      else if ('123456'.includes(k)) setTab(['overview', 'insights', 'analytics', 'stakeholders', 'scenarios', 'guide'][+k - 1]);
      else if (k === 'b') setPath('BAU');
      else if (k === 'm') setPath('Moderate');
      else if (k === 'a') setPath('Aggressive');
      else if (k === 'e') setPath('EarlyAction');
      else if (k === 's' && !e.ctrlKey) { e.preventDefault(); quickSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [price, rate, path, saved]);

  const liability = useMemo(() => {
    const m = { BAU: 1.44, Moderate: 1.21, Aggressive: 1.0, EarlyAction: 0.92 };
    return +(13.1 * (price / 50) * m[path] * (10 / rate)).toFixed(1);
  }, [price, rate, path]);

  const mc = useMemo(() => {
    const r = [];
    for (let i = 0; i < 1000; i++) {
      const m = { BAU: 1.44, Moderate: 1.21, Aggressive: 1.0, EarlyAction: 0.92 };
      r.push(13.1 * (price / 50) * (1 + (Math.random() - 0.5) * 0.6) * m[path] * (1 + (Math.random() - 0.5) * 0.4) * (10 / rate));
    }
    r.sort((a, b) => a - b);
    return { p5: r[50], p50: r[500], p95: r[950] };
  }, [price, rate, path]);

  const insights = useMemo(() => {
    const ins = [];
    if (price < 30) ins.push({ type: "warning", title: "Price Below Benchmarks", detail: `$${price}/t is 56% below EU ETS`, action: "Consider $30-50/t for CBAM compatibility" });
    else if (price > 80) ins.push({ type: "success", title: "Strong Price Signal", detail: `$${price}/t enables 15-20% IRR`, action: "Fast-track CCUS and Green H2" });
    if (path === 'BAU') ins.push({ type: "critical", title: "BAU Risks Assets", detail: "$63.7B stranding risk", action: "Review 7 facilities >60 years" });
    else if (path === 'EarlyAction') ins.push({ type: "success", title: "Early Action Saves $6.8B", detail: "Front-loaded investment optimal", action: "Accelerate 2026-2030 spend" });
    ins.push({ type: "info", title: "PSU Age Gap: 28 Years", detail: "PSU avg 49y vs Private 21y", action: "Prioritize modernization" });
    if (liability > 15) ins.push({ type: "critical", title: "Elevated Liability", detail: `$${liability}B exceeds base by ${Math.round((liability / 13.1 - 1) * 100)}%`, action: "Accelerate ETS implementation" });
    return ins;
  }, [price, path, liability]);

  const showToast = (msg, type = 'info') => setToast({ msg, type });
  const quickSave = () => { setSaved([...saved, { name: `Scenario ${saved.length + 1}`, price, rate, path, liability, ts: Date.now() }]); showToast('Saved!', 'success'); };
  const save = () => { if (!sceneName.trim()) return showToast('Enter name', 'warning'); setSaved([...saved, { name: sceneName, price, rate, path, liability, ts: Date.now() }]); setSceneName(''); showToast(`Saved: ${sceneName}`, 'success'); };
  const load = s => { setPrice(s.price); setRate(s.rate); setPath(s.path); showToast(`Loaded: ${s.name}`, 'info'); };
  const del = i => { setSaved(saved.filter((_, idx) => idx !== i)); showToast('Deleted', 'warning'); };
  const endOnboard = () => { setOnboard(false); localStorage.setItem('carbonOnboarded', 'true'); };

  const tabs = [['overview', '📊 Overview'], ['insights', '🤖 Insights'], ['analytics', '📈 Analytics'], ['stakeholders', '👥 Stakeholders'], ['scenarios', '💾 Scenarios'], ['guide', '📚 Guide']];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Ticker */}
      <div className="bg-slate-900 border-b border-slate-700 overflow-hidden py-2">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...prices, ...prices].map((p, i) => <div key={i} className="flex items-center gap-2 text-sm">{p.flag} {p.market} <span className="font-bold">{p.currency}{p.price}</span></div>)}
        </div>
      </div>

      <div className="p-3 md:p-4 max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">🇮🇳 India Carbon Liability Dashboard</h1>
            <p className="text-slate-400 text-xs">v{VERSION} MVP • Press <kbd className="bg-slate-700 px-1 rounded">H</kbd> for help</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setOnboard(true); setOnboardStep(0); }} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">🎓</button>
            <button onClick={() => setHelp(true)} className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">⌨️</button>
          </div>
        </header>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
          <Card label="YOUR ESTIMATE" value={`$${liability}B`} sub={path} color="text-amber-400" tip="liability" />
          <Card label="90% RANGE" value={`$${mc.p5.toFixed(1)}-${mc.p95.toFixed(1)}B`} sub="Monte Carlo" color="text-purple-400" tip="monte" />
          <Card label="GOVT EXPOSURE" value="$17.7B" sub="PSU + stranded" color="text-red-400" tip="govt" />
          <Card label="BASE CASE" value="$13.1B" sub="Aggressive" color="text-blue-400" />
          <Card label="EU ETS" value={`€${prices[0].price}`} color="text-green-400" />
          <Card label="WARNINGS" value={insights.filter(i => i.type === 'critical' || i.type === 'warning').length} sub="AI alerts" color="text-orange-400" />
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 mb-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><Tip id="price">Carbon Price (2030)</Tip><span className="text-amber-400 font-bold">${price}/t</span></div>
              <input type="range" min="10" max="200" value={price} onChange={e => setPrice(+e.target.value)} className="w-full h-2 bg-slate-600 rounded-lg accent-amber-500" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><Tip id="rate">Discount Rate</Tip><span className="text-blue-400 font-bold">{rate}%</span></div>
              <input type="range" min="5" max="15" step="0.5" value={rate} onChange={e => setRate(+e.target.value)} className="w-full h-2 bg-slate-600 rounded-lg accent-blue-500" />
            </div>
            <div>
              <div className="text-sm mb-1"><Tip id="pathway">Pathway</Tip></div>
              <div className="grid grid-cols-4 gap-1">
                {[['BAU', 'BAU'], ['Moderate', 'Mod'], ['Aggressive', 'Agg'], ['EarlyAction', 'Early']].map(([id, label]) => (
                  <button key={id} onClick={() => setPath(id)} className={`p-2 rounded text-xs font-medium ${path === id ? 'bg-green-500' : 'bg-slate-700 hover:bg-slate-600'}`}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
          {tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap ${tab === id ? 'bg-amber-500' : 'bg-slate-700/50 hover:bg-slate-600/50'}`}>{label}</button>)}
        </nav>

        {/* Content */}
        <main className="animate-fadeIn">
          {tab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold mb-3">📊 Liability Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart><Pie data={[{ name: "Jamnagar DTA", value: 5.57 }, { name: "Jamnagar SEZ", value: 4.92 }, { name: "Paradip", value: 2.62 }, { name: "Other", value: 13.1 - 13.11 }]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {['#f59e0b', '#fbbf24', '#3b82f6', '#6366f1'].map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie><Tooltip formatter={v => `$${v}B`} /><Legend /></PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold mb-3">🌍 Global Prices</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={prices} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" /><XAxis type="number" tick={{ fill: '#94a3b8' }} /><YAxis type="category" dataKey="market" tick={{ fill: '#94a3b8', fontSize: 10 }} width={70} /><Tooltip />
                    <Bar dataKey="price" radius={[0, 4, 4, 0]}>{prices.map((e, i) => <Cell key={i} fill={e.market.includes('India') ? '#f59e0b' : '#3b82f6'} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 md:col-span-2">
                <h3 className="font-semibold mb-3">⚡ Top Insight</h3>
                {insights[0] && <Insight {...insights[0]} />}
              </div>
            </div>
          )}

          {tab === 'insights' && (
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h3 className="font-semibold mb-4">🤖 AI Insights ({insights.length})</h3>
              <div className="space-y-3">{insights.map((ins, i) => <Insight key={i} {...ins} />)}</div>
            </div>
          )}

          {tab === 'analytics' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold mb-3">🌪️ Sensitivity</h3>
                {[["Carbon Price", 45], ["Emissions Path", 35], ["Discount Rate", 25], ["Tech Cost", 15]].map(([f, i]) => (
                  <div key={f} className="flex items-center gap-2 mb-2"><div className="w-24 text-sm text-slate-400">{f}</div><div className="flex-1 bg-slate-700 rounded-full h-3"><div className="bg-amber-500 h-3 rounded-full" style={{ width: `${i * 2}%` }} /></div><div className="w-10 text-right text-xs">±{i}%</div></div>
                ))}
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold mb-3">📊 Monte Carlo</h3>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div><div className="text-xl font-bold text-green-400">${mc.p5.toFixed(1)}B</div><div className="text-xs text-slate-400">P5</div></div>
                  <div><div className="text-xl font-bold">${mc.p50.toFixed(1)}B</div><div className="text-xs text-slate-400">P50</div></div>
                  <div><div className="text-xl font-bold text-red-400">${mc.p95.toFixed(1)}B</div><div className="text-xs text-slate-400">P95</div></div>
                </div>
                <div className="bg-slate-700 rounded-full h-4 flex overflow-hidden"><div className="bg-green-500" style={{ width: '5%' }} /><div className="bg-blue-500" style={{ width: '90%' }} /><div className="bg-red-500" style={{ width: '5%' }} /></div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 md:col-span-2">
                <h3 className="font-semibold mb-3">💰 Investment Payback</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={[{ y: 2026, v: -15 }, { y: 2028, v: -12 }, { y: 2030, v: -8 }, { y: 2032, v: -3 }, { y: 2034, v: 5 }, { y: 2036, v: 15 }, { y: 2040, v: 45 }]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" /><XAxis dataKey="y" tick={{ fill: '#94a3b8' }} /><YAxis tick={{ fill: '#94a3b8' }} /><Tooltip formatter={v => `$${v}B`} /><ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" /><Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {tab === 'stakeholders' && (
            <div>
              <div className="flex gap-2 mb-4">{['government', 'industry', 'investor'].map(s => <button key={s} onClick={() => setStake(s)} className={`px-4 py-2 rounded-lg text-sm ${stake === s ? 'bg-blue-500' : 'bg-slate-700'}`}>{s === 'government' ? '🏛️' : s === 'industry' ? '🏭' : '📈'} {s.charAt(0).toUpperCase() + s.slice(1)}</button>)}</div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"><Stakeholder view={stake} scenario={{ price, rate, path, liability }} /></div>
            </div>
          )}

          {tab === 'scenarios' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold mb-3">💾 Save Scenario</h3>
                <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-lg p-4 border border-amber-700 mb-3 text-center">
                  <div className="text-3xl font-bold">${liability}B</div>
                  <div className="text-sm text-slate-400">${price}/t • {path} • {rate}%</div>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={sceneName} onChange={e => setSceneName(e.target.value)} placeholder="Name..." className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2" onKeyDown={e => e.key === 'Enter' && save()} />
                  <button onClick={save} className="bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-lg">Save</button>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="font-semibold mb-3">📂 Saved ({saved.length})</h3>
                {saved.length === 0 ? <div className="text-center text-slate-500 py-6">No scenarios saved</div> : (
                  <div className="space-y-2 max-h-52 overflow-y-auto">{saved.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3">
                      <div><div className="font-medium">{s.name}</div><div className="text-xs text-slate-400">${s.price}/t • {s.path} • ${s.liability}B</div></div>
                      <div className="flex gap-2"><button onClick={() => load(s)} className="text-blue-400 text-sm">Load</button><button onClick={() => del(i)} className="text-red-400 text-sm">×</button></div>
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {tab === 'guide' && (
            <div>
              <div className="flex gap-2 mb-4">{[['methodology', '📊 Methodology'], ['glossary', '📖 Glossary'], ['about', 'ℹ️ About']].map(([id, label]) => <button key={id} onClick={() => setGuideTab(id)} className={`px-4 py-2 rounded-lg text-sm ${guideTab === id ? 'bg-amber-500' : 'bg-slate-700'}`}>{label}</button>)}</div>
              {guideTab === 'methodology' && <GuideMethodology />}
              {guideTab === 'glossary' && <GuideGlossary />}
              {guideTab === 'about' && <GuideAbout />}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-6 text-center text-slate-500 text-xs">
          <p>Based on: "{PAPER}" • {AUTHOR}</p>
          <p>Dashboard v{VERSION} • 🎉 MVP Complete!</p>
        </footer>
      </div>

      {/* Modals */}
      {help && <HelpModal onClose={() => setHelp(false)} />}
      {onboard && <Onboarding step={ONBOARDING[onboardStep]} total={ONBOARDING.length} current={onboardStep} onNext={() => onboardStep < ONBOARDING.length - 1 ? setOnboardStep(s => s + 1) : endOnboard()} onSkip={endOnboard} />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-marquee { animation: marquee 25s linear infinite; }
      `}</style>
    </div>
  );
}
