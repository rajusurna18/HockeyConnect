import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'STUDENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      toast.success('Account created! Welcome to HockeyConnect!');
      if (form.role === 'ADMIN') navigate('/admin/dashboard');
      else if (form.role === 'COACH') navigate('/coach/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-3xl">H</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Join HockeyConnect</h1>
          <p className="text-slate-400 mt-1">Start your hockey journey today</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Create an account</h2>

          {error && <div className="alert-error mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label">Full Name</label>
              <input type="text" className="input-field" placeholder="Your full name"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="label">Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="label">I am a</label>
              <select className="select-field" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="STUDENT">Student</option>
                <option value="COACH">Coach</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <input type="password" className="input-field" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="label">Confirm Password</label>
              <input type="password" className="input-field" placeholder="Repeat password"
                value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <span className="flex items-center justify-center gap-2">
                <div className="loading-spinner" /> Creating account...
              </span> : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
