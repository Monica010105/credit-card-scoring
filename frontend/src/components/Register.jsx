import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Registration failed');
      }
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Create an Account</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="John Doe" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="user@example.com" required />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-10" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="w-full btn h-12">Register</button>
        </form>
        {error && <div className="mt-4 text-center text-sm text-red-600 font-semibold">{error}</div>}
        <div className="mt-4 text-center text-sm">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
