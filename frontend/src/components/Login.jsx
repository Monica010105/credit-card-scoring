import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    // existing fake admin flow untouched
    if (email === 'admin@gmail.com' && password === '12345') {
      localStorage.setItem('adminToken', 'mock_jwt_token');
      navigate('/admin/dashboard');
      return;
    }
    
    // regular user auth
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid credentials');
        }
        const data = await response.json();
        throw new Error(data.detail || 'Login failed');
      }
      const data = await response.json();
      localStorage.setItem('userToken', data.access_token);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" value={email} onChange={e => {setEmail(e.target.value); setError(null);}} className="input-field" placeholder="user@example.com" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => {setPassword(e.target.value); setError(null);}} className="input-field pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="w-full btn h-12">Login to your Dashboard</button>
        </form>
        {error && <div className="mt-4 text-center text-sm text-red-600 font-semibold">{error}</div>}
        <div className="mt-4 text-center text-sm">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
}
