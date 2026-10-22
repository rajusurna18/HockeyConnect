import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      // Redirect based on role
      const user = JSON.parse(localStorage.getItem('hc_user') || '{}');
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'COACH') navigate('/coach/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: string) => {
    const creds = {
      STUDENT: { email: 'student@hockeyconnect.com', password: 'Student@123' },
      COACH: { email: 'coach@hockeyconnect.com', password: 'Coach@123' },
      ADMIN: { email: 'admin@hockeyconnect.com', password: 'Admin@123' },
    };
    setForm(creds[role as keyof typeof creds]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-3xl">H</span>
          </div>
          <h1 className="text-3xl font-bold text-white">HockeyConnect</h1>
          <p className="text-slate-400 mt-1">Connect. Train. Compete. Grow.</p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>

          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">Email address</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <span className="flex items-center justify-center gap-2">
                <div className="loading-spinner" /> Signing in...
              </span> : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-slate-400 text-xs mb-3">Demo accounts (click to fill):</p>
            <div className="flex gap-2">
              {['STUDENT', 'COACH', 'ADMIN'].map(role => (
                <button
                  key={role}
                  onClick={() => fillDemo(role)}
                  className="flex-1 text-xs py-1.5 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 
                             text-slate-300 hover:text-white transition-colors"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
