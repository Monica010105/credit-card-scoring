import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, RefreshCw, Users, TrendingUp } from 'lucide-react';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}`;

const COLORS = {
  APPROVE: '#10b981',
  REVIEW:  '#f59e0b',
  REJECT:  '#ef4444',
};

export default function AdminHistory() {
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
            <Link to="/admin/dashboard" className="flex items-center gap-3 py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors" onClick={() => setSidebarOpen(false)}>
              <TrendingUp size={16} /> Dashboard Overview
            </Link>
            <Link to="/admin/history" className="flex items-center gap-3 py-2 px-4 rounded-lg bg-blue-700 transition-colors" onClick={() => setSidebarOpen(false)}>
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
            <h2 className="text-3xl font-bold text-gray-800">Applicant History</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {records.length} record{records.length !== 1 ? 's' : ''} · Last refreshed: {lastRefresh.toLocaleTimeString()} · Auto-updates every 30s
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link to="/admin/dashboard" className="btn bg-gray-600 hover:bg-gray-700">Back to Dashboard</Link>
        </div>
      </div>

      {/* Records Table */}
      <div className="card overflow-hidden flex flex-col">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Detailed Application Records</h3>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-16 text-gray-500">
              <RefreshCw className="animate-spin mx-auto mb-3" size={28} />
              Loading data...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No applications submitted yet.</p>
              <p className="text-sm mt-1">Data will appear here once users submit the loan form.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="py-3 px-4 rounded-tl-lg font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Name</th>
                  <th className="py-3 px-4 font-semibold">Decision</th>
                  <th className="py-3 px-4 font-semibold">AI Score</th>
                  <th className="py-3 px-4 font-semibold">Risk %</th>
                  <th className="py-3 px-4 font-semibold">Age</th>
                  <th className="py-3 px-4 font-semibold">Income ($)</th>
                  <th className="py-3 px-4 font-semibold">Debt Ratio</th>
                  <th className="py-3 px-4 font-semibold">Credit Util</th>
                  <th className="py-3 px-4 font-semibold">Dependents</th>
                  <th className="py-3 px-4 font-semibold">Open Lines</th>
                  <th className="py-3 px-4 font-semibold">Real Estate</th>
                  <th className="py-3 px-4 font-semibold text-amber-600">30-59D Late</th>
                  <th className="py-3 px-4 font-semibold text-orange-600">60-89D Late</th>
                  <th className="py-3 px-4 rounded-tr-lg font-semibold text-red-600">90D+ Late</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-blue-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">#{r.id}</td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{r.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs font-bold rounded-full text-white"
                            style={{ backgroundColor: COLORS[r.decision] }}>
                        {r.decision}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-700">{parseFloat(r.credit_score).toFixed(1)}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{(r.probability * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4">{r.age}</td>
                    <td className="py-3 px-4 font-medium">${r.MonthlyIncome?.toLocaleString()}</td>
                    <td className="py-3 px-4">{r.DebtRatio?.toFixed(2)}</td>
                    <td className="py-3 px-4 text-blue-600 font-medium">{(r.RevolvingUtilizationOfUnsecuredLines * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4">{r.NumberOfDependents}</td>
                    <td className="py-3 px-4">{r.NumberOfOpenCreditLinesAndLoans}</td>
                    <td className="py-3 px-4">{r.NumberRealEstateLoansOrLines}</td>
                    <td className="py-3 px-4 text-center text-amber-600 font-medium">{r.NumberOfTime30_59DaysPastDueNotWorse}</td>
                    <td className="py-3 px-4 text-center text-orange-600 font-medium">{r.NumberOfTime60_89DaysPastDueNotWorse}</td>
                    <td className="py-3 px-4 text-center font-bold text-red-500">{r.NumberOfTimes90DaysLate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
