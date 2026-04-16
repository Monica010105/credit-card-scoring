import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid, XAxis, YAxis,
} from 'recharts';
import { Menu, RefreshCw, TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`;

const COLORS = {
  APPROVE: '#10b981',
  REVIEW:  '#f59e0b',
  REJECT:  '#ef4444',
};

function StatCard({ label, value, sub, color, icon: Icon }) {
  return (
    <div className="card flex items-center gap-4 border-t-4" style={{ borderColor: color }}>
      <div className="p-3 rounded-full" style={{ backgroundColor: color + '20' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-gray-500 text-sm uppercase font-semibold">{label}</p>
        <p className="text-3xl font-bold" style={{ color }}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
        {label && <p className="font-semibold text-gray-700 mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || p.fill }}>
            {p.name}: <span className="font-bold">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminPanel() {
  const [records, setRecords]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const navigate = useNavigate();

  const fetchData = () => {
    setLoading(true);
    axios.get(`${API_URL}/admin/users`)
      .then(res => { setRecords(res.data); setLastRefresh(new Date()); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) { navigate('/login'); return; }
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const total    = records.length;
  const approved = records.filter(r => r.decision === 'APPROVE').length;
  const rejected = records.filter(r => r.decision === 'REJECT').length;
  const reviewed = records.filter(r => r.decision === 'REVIEW').length;

  // 1. Decision distribution
  const decisionData = ['APPROVE', 'REVIEW', 'REJECT'].map(d => ({
    name: d,
    count: records.filter(r => r.decision === d).length,
    color: COLORS[d],
  }));

  // 2. Credit score trend (latest 20)
  const scoreTimeline = [...records].reverse().slice(-20).map(r => ({
    index: `#${r.id}`,
    score: parseFloat(parseFloat(r.credit_score).toFixed(1)),
  }));

  return (
    <div className="space-y-8 relative">

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-blue-900 text-white z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-1">⚡ Credit Score AI</h2>
          <p className="text-blue-300 text-sm mb-8">Admin Panel</p>
          <nav className="space-y-3">
            <Link to="/admin/dashboard" className="flex items-center gap-3 py-2 px-4 rounded-lg bg-blue-700 transition-colors" onClick={() => setSidebarOpen(false)}>
              <TrendingUp size={16} /> Dashboard Overview
            </Link>
            <Link to="/admin/history" className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors" onClick={() => setSidebarOpen(false)}>
              <Users size={16} /> Applicant History
            </Link>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Menu className="w-8 h-8 text-gray-700" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-sm text-gray-400 mt-0.5">Last refreshed: {lastRefresh.toLocaleTimeString()} · Auto-updates every 30s</p>
          </div>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={total}    color="#3b82f6" icon={Users}       sub="All time" />
        <StatCard label="Approved"           value={approved} color="#10b981" icon={CheckCircle} sub={`${total ? ((approved/total)*100).toFixed(1) : 0}% rate`} />
        <StatCard label="Under Review"       value={reviewed} color="#f59e0b" icon={Clock}       sub={`${total ? ((reviewed/total)*100).toFixed(1) : 0}% rate`} />
        <StatCard label="Rejected"           value={rejected} color="#ef4444" icon={XCircle}     sub={`${total ? ((rejected/total)*100).toFixed(1) : 0}% rate`} />
      </div>



      {/* ── Row 1: Decision Pie + Credit Score Trend ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Decision Distribution Donut */}
        <div className="card flex flex-col" style={{ minHeight: 340 }}>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Decision Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={decisionData} cx="50%" cy="50%"
                innerRadius={65} outerRadius={100}
                paddingAngle={5} dataKey="count" nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {decisionData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6">
            {decisionData.map(e => (
              <div key={e.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: e.color }} />
                <span className="text-sm font-medium text-gray-600">{e.name} ({e.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Score Trend */}
        <div className="card flex flex-col" style={{ minHeight: 340 }}>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            Credit Score Trend <span className="text-xs text-gray-400 font-normal">(latest 20 applications)</span>
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={scoreTimeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="index" tick={{ fontSize: 10 }} />
              <YAxis domain={[300, 850]} tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="score" name="Credit Score"
                    stroke="#3b82f6" strokeWidth={2.5} fill="url(#scoreGrad)"
                    dot={{ r: 3, fill: '#3b82f6' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
