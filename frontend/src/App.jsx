import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import UserPanel from './components/UserPanel';
import AdminPanel from './components/AdminPanel';
import AdminHistory from './components/AdminHistory';
import Login from './components/Login';
import Register from './components/Register';
import Hero from './components/Hero';

function Navigation() {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith('/admin');
  const isHero   = location.pathname === '/';
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  // Hero page has its own self-contained navbar
  if (isHero) return null;

  return (
    <nav className="bg-blue-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-tight">⚡ Credit Score AI</h1>
        {!isAuthRoute && (
          <div className="space-x-4 flex items-center">
            {!isAdmin ? (
              <>
                <Link to="/app" className="hover:text-blue-200">Loan Application</Link>
              </>
            ) : (
              <>
                <Link to="/admin/dashboard" className="hover:text-blue-200">Dashboard</Link>
                <Link to="/admin/history"   className="hover:text-blue-200">History</Link>
              </>
            )}
            <button onClick={handleLogout} className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm font-semibold ml-4">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />

        <main>
          <Routes>
            {/* Landing / Hero */}
            <Route path="/"        element={<Hero />} />

            {/* Auth */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User */}
            <Route path="/app"      element={<UserPanel />} />

            {/* Admin */}
            <Route path="/admin"           element={<Navigate to="/admin/dashboard" />} />
            <Route path="/admin/dashboard" element={<AdminPanel />} />
            <Route path="/admin/history"   element={<AdminHistory />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
