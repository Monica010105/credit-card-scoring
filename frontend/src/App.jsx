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
  const hideLogos = isAuthRoute || location.pathname === '/app' || isAdmin;

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  // Hero page has its own self-contained navbar
  if (isHero) return null;

  return (
    <nav className="bg-white border-b-4 border-blue-800 text-blue-900 p-2 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Left Side: Logos & Title */}
        <div className="flex items-center gap-4">
          {!hideLogos && <img src="/kingston.png" alt="Kingston Engineering College" className="h-16 object-contain bg-white p-1 rounded" />}
          <Link to="/" className="flex items-center gap-2">
            {!isAuthRoute && <img src="/logo.png" alt="Logo" className="h-10 object-contain" />}
            {!isAuthRoute && <h1 className="text-xl font-bold tracking-tight text-blue-900">Credit Score AI</h1>}
          </Link>
        </div>

        {/* Center: (Empty) */}
        <div className="flex flex-col items-center justify-center">
        </div>

        {/* Right Side: Anna University & Navigation Links */}
        <div className="flex items-center space-x-6">
          {!hideLogos && <img src="/anna.png" alt="Anna University" className="h-16 object-contain" />}
          
          {!isAuthRoute && (
            <div className="space-x-4 flex items-center ml-4 border-l-2 pl-4 border-gray-200">
              {!isAdmin ? (
                <>
                  <Link to="/app" className="hover:text-blue-600 font-semibold text-sm">Loan Application</Link>
                </>
              ) : (
                <>
                  <Link to="/admin/dashboard" className="hover:text-blue-600 font-semibold text-sm">Dashboard</Link>
                  <Link to="/admin/history"   className="hover:text-blue-600 font-semibold text-sm">History</Link>
                </>
              )}
              <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-bold ml-4 shadow">
                Logout
              </button>
            </div>
          )}
        </div>
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
