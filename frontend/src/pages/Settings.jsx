import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import {
  Sun, Moon, Monitor, Shield, Bell, Sliders, Globe,
  Save, CheckCircle, AlertCircle, RefreshCw, Wifi, Database, Trash2
} from 'lucide-react';
import { clearClaims } from '../services/api';

// ── Helpers ──────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className="toggle-track"
    style={{ background: checked ? 'var(--primary)' : 'var(--border-strong)' }}
  >
    <div className="toggle-thumb" style={{ left: checked ? 20 : 3 }} />
  </button>
);

const Section = ({ title, icon: Icon, children }) => (
  <div className="card" style={{ marginBottom: 16 }}>
    <div className="flex items-center gap-3 mb-5" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-soft)' }}>
        <Icon className="h-4 w-4" style={{ color: 'var(--primary)' }} />
      </div>
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{title}</h3>
    </div>
    {children}
  </div>
);

const Row = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border)' }}>
    <div className="flex-1 mr-4">
      <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{label}</p>
      {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{description}</p>}
    </div>
    {children}
  </div>
);

// ── Main Settings Component ───────────────────────────────────
const Settings = () => {
  const { theme, setTheme } = useTheme();

  // App config state (stored in localStorage)
  const [config, setConfig] = useState(() => ({
    fraudThreshold: parseInt(localStorage.getItem('ig-fraud-threshold') || '50'),
    autoSave: localStorage.getItem('ig-auto-save') !== 'false',
    rowsPerPage: localStorage.getItem('ig-rows-per-page') || '10',
    dateFormat: localStorage.getItem('ig-date-format') || 'MM/DD/YYYY',
    modelVersion: localStorage.getItem('ig-model-version') || 'fraud_v2',
    highRiskAlerts: localStorage.getItem('ig-high-risk-alerts') !== 'false',
    dailySummary: localStorage.getItem('ig-daily-summary') === 'true',
    emailAlerts: localStorage.getItem('ig-email-alerts') === 'true',
    alertEmail: localStorage.getItem('ig-alert-email') || '',
    backendUrl: localStorage.getItem('ig-backend-url') || 'http://localhost:8000',
    apiTimeout: parseInt(localStorage.getItem('ig-api-timeout') || '30'),
  }));

  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'ok' | 'fail'

  const update = (key, value) => setConfig(prev => ({ ...prev, [key]: value }));

  const handleSave = () => {
    Object.entries(config).forEach(([k, v]) => localStorage.setItem(`ig-${k.replace(/([A-Z])/g, '-$1').toLowerCase()}`, String(v)));
    setSaved(true);
    toast.success('Settings saved successfully!');
    setTimeout(() => setSaved(false), 2500);
  };

  const testConnection = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch(`${config.backendUrl}/docs`, { signal: AbortSignal.timeout(5000) });
      setTestStatus(res.ok || res.status === 200 ? 'ok' : 'fail');
    } catch {
      setTestStatus('fail');
    }
    setTimeout(() => setTestStatus(null), 4000);
  };

  const themes = [
    { id: 'light', label: 'Light', icon: Sun, preview: ['#F0F2F5', '#FFFFFF', '#E8EAED'] },
    { id: 'dark', label: 'Dark', icon: Moon, preview: ['#0F0F1A', '#1A1A2E', '#13131F'] },
    { id: 'system', label: 'System', icon: Monitor, preview: ['#6B7280', '#9CA3AF', '#4B5563'] },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-slide-in space-y-1">
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Settings</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Manage appearance, model config, notifications and API options.</p>
      </div>

      {/* ── 1. Appearance ── */}
      <Section title="Appearance" icon={Sun}>
        <p className="text-xs mb-4" style={{ color: 'var(--text-2)' }}>Choose your display theme. Changes apply instantly.</p>
        <div className="grid grid-cols-3 gap-3">
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className="relative rounded-xl p-4 transition-all text-left"
              style={{
                border: theme === t.id ? `2px solid var(--primary)` : `2px solid var(--border)`,
                background: theme === t.id ? 'var(--primary-soft)' : 'var(--bg)',
              }}
            >
              {/* Mini preview */}
              <div className="flex gap-1 mb-3 h-8 rounded-lg overflow-hidden">
                {t.preview.map((c, i) => <div key={i} className="flex-1 h-full" style={{ background: c }} />)}
              </div>
              <div className="flex items-center gap-2">
                <t.icon className="h-3.5 w-3.5" style={{ color: theme === t.id ? 'var(--primary)' : 'var(--text-3)' }} />
                <span className="text-xs font-semibold" style={{ color: theme === t.id ? 'var(--primary)' : 'var(--text-2)' }}>{t.label}</span>
              </div>
              {theme === t.id && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* ── 2. App Configuration ── */}
      <Section title="App Configuration" icon={Sliders}>
        {/* Fraud Threshold */}
        <div className="py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Fraud Detection Threshold</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Claims above this probability are flagged as fraudulent</p>
            </div>
            <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              {config.fraudThreshold}%
            </span>
          </div>
          <input
            type="range" min={10} max={90} step={5}
            value={config.fraudThreshold}
            onChange={e => update('fraudThreshold', parseInt(e.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--primary)' }}
          />
          <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>
            <span>10% (Sensitive)</span><span>90% (Strict)</span>
          </div>
        </div>

        <Row label="Auto-save Predictions" description="Automatically log each prediction to claims history">
          <Toggle checked={config.autoSave} onChange={v => update('autoSave', v)} />
        </Row>

        <Row label="Rows per Page" description="Default rows shown in tables">
          <select
            value={config.rowsPerPage}
            onChange={e => update('rowsPerPage', e.target.value)}
            className="form-input"
            style={{ width: 90 }}
          >
            {['5', '10', '25', '50'].map(v => <option key={v} value={v}>{v} rows</option>)}
          </select>
        </Row>

        <Row label="Date Format" description="How dates are displayed across the app">
          <select
            value={config.dateFormat}
            onChange={e => update('dateFormat', e.target.value)}
            className="form-input"
            style={{ width: 140 }}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </Row>

        <Row label="Active ML Model" description="Fraud detection model version to use">
          <select
            value={config.modelVersion}
            onChange={e => update('modelVersion', e.target.value)}
            className="form-input"
            style={{ width: 140 }}
          >
            <option value="fraud_v1">fraud_v1 (stable)</option>
            <option value="fraud_v2">fraud_v2 (latest)</option>
          </select>
        </Row>
      </Section>

      {/* ── 3. Notifications ── */}
      <Section title="Notifications" icon={Bell}>
        <Row label="High-Risk Fraud Alerts" description="Notify immediately when a claim scores above threshold">
          <Toggle checked={config.highRiskAlerts} onChange={v => update('highRiskAlerts', v)} />
        </Row>
        <Row label="Daily Summary Report" description="Receive a daily digest of claims activity">
          <Toggle checked={config.dailySummary} onChange={v => update('dailySummary', v)} />
        </Row>
        <Row label="Email Notifications" description="Send alerts to the address below">
          <Toggle checked={config.emailAlerts} onChange={v => update('emailAlerts', v)} />
        </Row>
        {config.emailAlerts && (
          <div className="pt-3">
            <label className="form-label">Alert Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={config.alertEmail}
              onChange={e => update('alertEmail', e.target.value)}
              className="form-input"
            />
          </div>
        )}
      </Section>

      {/* ── 4. API Configuration ── */}
      <Section title="API Configuration" icon={Globe}>
        <Row label="Backend URL" description="The FastAPI backend endpoint">
          <input
            type="text"
            value={config.backendUrl}
            onChange={e => update('backendUrl', e.target.value)}
            className="form-input"
            style={{ width: 220 }}
          />
        </Row>
        <Row label="Request Timeout (seconds)" description="Abort requests after this many seconds">
          <input
            type="number"
            min={5} max={120}
            value={config.apiTimeout}
            onChange={e => update('apiTimeout', parseInt(e.target.value))}
            className="form-input"
            style={{ width: 90 }}
          />
        </Row>
        {/* Test Connection */}
        <div className="flex items-center justify-between pt-3">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Test Connection</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Verify the backend is reachable</p>
          </div>
          <div className="flex items-center gap-3">
            {testStatus === 'ok' && <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--success)' }}><CheckCircle className="h-4 w-4" />Connected</span>}
            {testStatus === 'fail' && <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--danger)' }}><AlertCircle className="h-4 w-4" />Unreachable</span>}
            <button
              onClick={testConnection}
              disabled={testStatus === 'testing'}
              className="btn-outline"
              style={{ gap: 6 }}
            >
              {testStatus === 'testing'
                ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />Testing...</>
                : <><Wifi className="h-3.5 w-3.5" />Test</>
              }
            </button>
          </div>
        </div>
      </Section>

      {/* ── 5. Data Management ── */}
      <Section title="Data Management" icon={Database}>
        <div className="flex items-center justify-between py-3">
          <div className="mr-4">
            <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>Clear Claims History</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>Permanently delete all claims from the database</p>
          </div>
          <button
            onClick={async () => {
              if (window.confirm('Are you sure you want to delete all claims? This cannot be undone. \nOnly Admins or your own claims will be deleted.')) {
                const loadingToast = toast.loading('Clearing claims...');
                try {
                  await clearClaims();
                  toast.dismiss(loadingToast);
                  toast.success('Claims history cleared!');
                } catch (e) {
                  toast.dismiss(loadingToast);
                  toast.error('Failed to clear claims. Check your permissions.');
                }
              }
            }}
            className="btn-outline"
            style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Data
          </button>
        </div>
      </Section>

      {/* ── Save button ── */}
      <div className="flex justify-end pt-2">
        <button onClick={handleSave} className="btn-primary" style={{ minWidth: 140 }}>
          {saved
            ? <><CheckCircle className="h-4 w-4" />Saved!</>
            : <><Save className="h-4 w-4" />Save Settings</>
          }
        </button>
      </div>
    </div>
  );
};

export default Settings;
