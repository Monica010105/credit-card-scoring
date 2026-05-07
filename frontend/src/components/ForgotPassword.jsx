import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, new_password: newPassword })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to reset password');
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Set New Password</h2>
        {success ? (
          <div className="text-center text-green-600 font-semibold mb-4">
            Password updated successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" value={email} onChange={e => {setEmail(e.target.value); setError(null);}} className="input-field" placeholder="user@example.com" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <div className="relative">
                <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={e => {setNewPassword(e.target.value); setError(null);}} className="input-field pr-10" required />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={e => {setConfirmPassword(e.target.value); setError(null);}} className="input-field pr-10" required />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-[55%] transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button type="submit" className="w-full btn h-12">Set Password</button>
          </form>
        )}
        {error && <div className="mt-4 text-center text-sm text-red-600 font-semibold">{error}</div>}
        <div className="mt-4 text-center text-sm flex flex-col space-y-2">
          <span>Remembered your password? <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link></span>
        </div>
      </div>
    </div>
  );
}
