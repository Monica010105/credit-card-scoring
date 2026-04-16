import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

export default function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/admin/login`, { username, password });
      localStorage.setItem('adminToken', data.access_token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full btn h-12">Login</button>
        </form>
      </div>
    </div>
  );
}
