import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, User, Mail, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '', role: 'agent' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.role);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Username may already exist.');
    } finally { setLoading(false); }
  };

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return Math.min(s, 3);
  })();
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'var(--danger)', 'var(--warning)', 'var(--success)'][strength];

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'rgba(37,99,235,0.06)', filter: 'blur(80px)', transform: 'translate(30%,-30%)' }} />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'rgba(16,185,129,0.05)', filter: 'blur(80px)', transform: 'translate(-30%,30%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-slide-in">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--primary)', boxShadow: '0 8px 30px rgba(37,99,235,0.35)' }}>
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>
            Insure<span style={{ color: 'var(--primary)' }}>Guard</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Create your account</p>
        </div>

        <div className="card animate-scale-in" style={{ padding: 32 }}>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-5"
              style={{ background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}>
              <ShieldAlert className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="form-label">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-3)' }} />
                <input type="text" name="username" required placeholder="Choose a username"
                  value={form.username} onChange={handleChange}
                  className="form-input" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-3)' }} />
                <input type="email" name="email" required placeholder="you@example.com"
                  value={form.email} onChange={handleChange}
                  className="form-input" style={{ paddingLeft: 38 }} />
              </div>
            </div>

            {/* Role selector */}
            <div>
              <label className="form-label">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'agent', label: '🧑‍💼 Agent', desc: 'Submit & review claims' },
                  { value: 'admin', label: '🛡️ Admin', desc: 'Full system access' },
                ].map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setForm(p => ({ ...p, role: r.value }))}
                    className="p-3 rounded-xl text-left transition-all"
                    style={{
                      border: `1.5px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                      background: form.role === r.value ? 'var(--primary-soft)' : 'var(--bg)',
                    }}>
                    <p className="text-xs font-semibold" style={{ color: form.role === r.value ? 'var(--primary)' : 'var(--text-1)' }}>{r.label}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-3)' }} />
                <input type={showPw ? 'text' : 'password'} name="password" required placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange}
                  className="form-input" style={{ paddingLeft: 38, paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: strength >= i ? strengthColor : 'var(--border)' }} />
                    ))}
                  </div>
                  <p className="text-[10px] font-medium" style={{ color: strengthColor }}>{strengthLabel}</p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-3)' }} />
                <input type={showPw ? 'text' : 'password'} name="confirm" required placeholder="Re-enter password"
                  value={form.confirm} onChange={handleChange}
                  className="form-input" style={{ paddingLeft: 38, paddingRight: 40 }} />
                {form.confirm && form.confirm === form.password && (
                  <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--success)' }} />
                )}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                : <>Create Account <ArrowRight className="h-4 w-4 ml-1" /></>
              }
            </button>
          </form>

          <div className="mt-6 pt-5 text-center text-sm" style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-3)' }}>Already have an account?{' '}</span>
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-3)' }}>
          InsureGuard · AI-Powered Insurance Analytics
        </p>
      </div>
    </div>
  );
};

export default Register;
