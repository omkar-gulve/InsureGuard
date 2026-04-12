import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Decorative blobs */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'rgba(37,99,235,0.06)', filter: 'blur(80px)', transform: 'translate(30%,-30%)' }} />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'rgba(16,185,129,0.05)', filter: 'blur(80px)', transform: 'translate(-30%,30%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-slide-in">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--primary)', boxShadow: '0 8px 30px rgba(37,99,235,0.35)' }}
          >
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>
            Insure<span style={{ color: 'var(--primary)' }}>Guard</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card animate-scale-in" style={{ padding: 32 }}>
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm mb-5"
              style={{ background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}
            >
              <ShieldAlert className="h-4 w-4 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Username</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-3)' }} />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  placeholder="Enter your username"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <span className="text-xs" style={{ color: 'var(--primary)', cursor: 'pointer' }}>Forgot password?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-3)' }} />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: 38, paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm mt-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4 ml-1" /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 text-center text-sm" style={{ borderTop: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--text-3)' }}>Don't have an account?{' '}</span>
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
              Create account
            </Link>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-3)' }}>
          InsureGuard · AI-Powered Insurance Analytics
        </p>
      </div>
    </div>
  );
};

export default Login;
