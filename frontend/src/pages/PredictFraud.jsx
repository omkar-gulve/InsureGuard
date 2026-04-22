import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { predictFraud, createClaim } from '../services/api';
import {
  ShieldAlert, CheckCircle, Activity, Info, Save,
  AlertTriangle, FileText, Users, DollarSign, Car, Eye
} from 'lucide-react';

const yesNoOptions = ['YES', 'NO', '?'];
const incidentTypeOptions = ['Single Vehicle Collision', 'Vehicle Theft', 'Multi-vehicle Collision', 'Parked Car'];
const incidentSeverityOptions = ['Major Damage', 'Minor Damage', 'Total Loss', 'Trivial Damage'];

const riskFactors = [
  { label: 'No police report', impact: 'Medium', color: 'var(--warning)' },
  { label: 'Multiple bodily injuries', impact: 'High', color: 'var(--danger)' },
  { label: 'High claim-to-premium ratio', impact: 'High', color: 'var(--danger)' },
  { label: 'New customer (<12 months)', impact: 'Medium', color: 'var(--warning)' },
  { label: 'No witnesses present', impact: 'Low', color: 'var(--success)' },
];

const impactBadge = (impact, color) => (
  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>
    {impact}
  </span>
);

const FormField = ({ label, icon: Icon, children }) => (
  <div>
    <label className="form-label flex items-center gap-1.5">
      {Icon && <Icon className="h-3 w-3" />} {label}
    </label>
    {children}
  </div>
);

const PredictFraud = () => {
  const [formData, setFormData] = useState({
    policy_number: `POL-${Math.floor(Math.random() * 90000) + 10000}`,
    total_claim_amount: '',
    months_as_customer: '',
    incident_type: 'Single Vehicle Collision',
    incident_severity: 'Minor Damage',
    property_damage: 'NO',
    police_report_available: 'NO',
    witnesses: '0',
    bodily_injuries: '0',
    policy_annual_premium: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ig-fraud-history') || '[]'); }
    catch { return []; }
  });

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setResult(null); setError(''); setSaveStatus('');
    try {
      const payload = {
        incident_type: formData.incident_type,
        incident_severity: formData.incident_severity,
        property_damage: formData.property_damage,
        total_claim_amount: parseFloat(formData.total_claim_amount),
        months_as_customer: parseInt(formData.months_as_customer),
        police_report_available: formData.police_report_available,
        witnesses: parseInt(formData.witnesses),
        bodily_injuries: parseInt(formData.bodily_injuries),
        policy_annual_premium: parseFloat(formData.policy_annual_premium),
      };
      const res = await predictFraud(payload);
      setResult(res.data);

      // Save to local history
      const entry = {
        id: Date.now(),
        policy: formData.policy_number,
        prediction: res.data.fraud_prediction,
        probability: res.data.probability,
        amount: formData.total_claim_amount,
        date: new Date().toLocaleDateString(),
      };
      const updated = [entry, ...history].slice(0, 5);
      setHistory(updated);
      localStorage.setItem('ig-fraud-history', JSON.stringify(updated));

      // Toast result
      if (res.data.fraud_prediction === 'Fraudulent') {
        toast.error(`⚠️ Fraud Detected — ${(res.data.probability * 100).toFixed(1)}% probability`, { duration: 4500 });
      } else {
        toast.success(`✅ Claim Verified — ${(res.data.probability * 100).toFixed(1)}% fraud probability`);
      }

      // Auto-save to claims DB
      const autoSave = localStorage.getItem('ig-auto-save') !== 'false';
      if (autoSave) {
        try {
          await createClaim({
            policy_number: formData.policy_number,
            claim_amount: parseFloat(formData.total_claim_amount),
            fraud_probability: res.data.probability,
            status: res.data.fraud_prediction === 'Fraudulent' ? 'Rejected' : 'Approved',
          });
          setSaveStatus('saved');
          toast.success('Claim saved to history', { duration: 2000 });
        } catch { setSaveStatus('error'); toast.error('Failed to save claim to history'); }
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to analyze claim. Check all fields.';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const isFraud = result?.fraud_prediction === 'Fraudulent';
  const probPct = result ? (result.probability * 100).toFixed(1) : 0;
  const fraudThreshold = parseInt(localStorage.getItem('ig-fraud-threshold') || '50');

  return (
    <div className="animate-fade-slide-in">
      <div className="mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <ShieldAlert className="h-5 w-5" style={{ color: 'var(--danger)' }} /> Fraud Detection Engine
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Enter claim details to run ML analysis. Threshold: <strong style={{ color: 'var(--primary)' }}>{fraudThreshold}%</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Left: Form ── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-5" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Claim Details</p>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, policy_number: `POL-${Math.floor(Math.random() * 90000) + 10000}` }))}
                className="text-xs font-medium" style={{ color: 'var(--primary)' }}
              >
                ↻ New Policy ID
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <FormField label="Policy Number" icon={FileText}>
                  <input
                    type="text" readOnly name="policy_number"
                    value={formData.policy_number}
                    className="form-input font-mono text-sm opacity-70"
                  />
                </FormField>

                <FormField label="Total Claim Amount ($)" icon={DollarSign}>
                  <input type="number" required name="total_claim_amount" placeholder="e.g. 65,000"
                    className="form-input" value={formData.total_claim_amount} onChange={handleChange} />
                </FormField>

                <FormField label="Annual Premium ($)" icon={DollarSign}>
                  <input type="number" step="0.01" required name="policy_annual_premium" placeholder="e.g. 1,450"
                    className="form-input" value={formData.policy_annual_premium} onChange={handleChange} />
                </FormField>

                <FormField label="Months as Customer" icon={Users}>
                  <input type="number" required name="months_as_customer" placeholder="e.g. 48"
                    className="form-input" value={formData.months_as_customer} onChange={handleChange} />
                </FormField>

                <FormField label="Police Report Available" icon={FileText}>
                  <select name="police_report_available" value={formData.police_report_available} onChange={handleChange} className="form-input cursor-pointer">
                    {yesNoOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </FormField>

                <FormField label="Witnesses" icon={Eye}>
                  <input type="number" required name="witnesses" min="0" max="10" placeholder="0–10"
                    className="form-input" value={formData.witnesses} onChange={handleChange} />
                </FormField>

                <FormField label="Bodily Injuries Reported" icon={Users}>
                  <input type="number" required name="bodily_injuries" min="0" placeholder="0 or more"
                    className="form-input" value={formData.bodily_injuries} onChange={handleChange} />
                </FormField>

                <FormField label="Damage Type" icon={Car}>
                  <select name="incident_type" value={formData.incident_type} onChange={handleChange} className="form-input cursor-pointer">
                    {incidentTypeOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </FormField>

                <FormField label="Incident Severity" icon={ShieldAlert}>
                  <select name="incident_severity" value={formData.incident_severity} onChange={handleChange} className="form-input cursor-pointer">
                    {incidentSeverityOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </FormField>

                <FormField label="Property Damage" icon={Car}>
                  <select name="property_damage" value={formData.property_damage} onChange={handleChange} className="form-input cursor-pointer">
                    {yesNoOptions.map(o => <option key={o}>{o}</option>)}
                  </select>
                </FormField>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 rounded-xl text-sm" style={{ background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}>
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <><Activity className="h-4 w-4" /> Run Fraud Analysis</>
                )}
              </button>
            </form>
          </div>

          {/* Risk Factors info */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-4 w-4" style={{ color: 'var(--primary)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Key Risk Indicators</p>
            </div>
            <div className="space-y-2">
              {riskFactors.map(f => (
                <div key={f.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-2)' }}>{f.label}</p>
                  {impactBadge(f.impact, f.color)}
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--text-3)' }}>
              ⓘ These factors influence the model's fraud probability score. Higher impact factors carry more weight.
            </p>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* Result card */}
          <div className="card flex flex-col items-center justify-center text-center" style={{ minHeight: 320 }}>
            {!result && !loading && !error && (
              <div>
                <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg)' }}>
                  <ShieldAlert className="h-9 w-9" style={{ color: 'var(--text-3)' }} />
                </div>
                <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Ready to Analyze</p>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>Fill in the claim details and click Run Analysis.</p>
              </div>
            )}

            {loading && (
              <div>
                <div className="relative h-20 w-20 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: 'var(--border)' }} />
                  <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary) transparent transparent transparent' }} />
                  <Activity className="absolute inset-0 m-auto h-7 w-7 animate-pulse" style={{ color: 'var(--primary)' }} />
                </div>
                <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Analyzing...</p>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>Running ML inference on claim data</p>
              </div>
            )}

            {result && !loading && (
              <div className="w-full animate-scale-in">
                {/* Verdict icon */}
                <div
                  className="h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4 border-4"
                  style={{
                    borderColor: isFraud ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)',
                    background: isFraud ? 'var(--danger-soft)' : 'var(--success-soft)',
                  }}
                >
                  {isFraud
                    ? <ShieldAlert className="h-12 w-12" style={{ color: 'var(--danger)' }} />
                    : <CheckCircle className="h-12 w-12" style={{ color: 'var(--success)' }} />
                  }
                </div>

                <h3 className="text-2xl font-bold mb-1" style={{ color: isFraud ? 'var(--danger)' : 'var(--success)' }}>
                  {isFraud ? 'Fraud Suspected' : 'Claim Verified'}
                </h3>
                <span className={isFraud ? 'badge-rejected' : 'badge-approved'} style={{ marginBottom: 20, display: 'inline-block' }}>
                  {isFraud ? 'REJECTED' : 'APPROVED'}
                </span>

                {/* Score bar */}
                <div className="w-full mt-4 p-4 rounded-xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Fraud Probability</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{probPct}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${probPct}%`,
                        background: isFraud
                          ? 'linear-gradient(90deg, #f97316, #ef4444)'
                          : 'linear-gradient(90deg, #10b981, #34d399)',
                      }}
                    />
                  </div>
                  {saveStatus === 'saved' && (
                    <p className="flex items-center gap-1 mt-3 text-xs justify-center" style={{ color: 'var(--success)' }}>
                      <Save className="h-3 w-3" /> Saved to claims history
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent predictions mini-history */}
          {history.length > 0 && (
            <div className="card">
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Recent Predictions</p>
              <div className="space-y-2">
                {history.map(h => (
                  <div key={h.id} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: h.prediction === 'Fraudulent' ? 'var(--danger)' : 'var(--success)' }}>
                        {h.prediction === 'Fraudulent' ? '✗' : '✓'}
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-1)' }}>{h.policy}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{h.date}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold" style={{ color: h.prediction === 'Fraudulent' ? 'var(--danger)' : 'var(--success)' }}>
                      {(h.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictFraud;
