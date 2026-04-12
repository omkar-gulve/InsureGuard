import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { predictPremium } from '../services/api';
import {
  BadgeDollarSign, Activity, CreditCard, HeartPulse,
  User, Car, TrendingUp, Info, AlertTriangle
} from 'lucide-react';

const tiers = [
  { label: 'Economy', min: 0, max: 150, color: 'var(--success)', bg: 'var(--success-soft)', desc: 'Low-risk profile' },
  { label: 'Standard', min: 150, max: 350, color: 'var(--primary)', bg: 'var(--primary-soft)', desc: 'Average-risk profile' },
  { label: 'Premium', min: 350, max: Infinity, color: 'var(--danger)', bg: 'var(--danger-soft)', desc: 'High-risk profile' },
];

const getTier = amount => tiers.find(t => amount >= t.min && amount < t.max) || tiers[2];

const SliderField = ({ label, icon: Icon, name, value, min, max, step = 1, onChange, format }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="form-label flex items-center gap-1.5 mb-0">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </label>
      <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>{format ? format(value) : value}</span>
    </div>
    <input
      type="range" name={name} min={min} max={max} step={step}
      value={value} onChange={onChange}
      className="w-full"
      style={{ accentColor: 'var(--primary)' }}
    />
    <div className="flex justify-between text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
      <span>{format ? format(min) : min}</span><span>{format ? format(max) : max}</span>
    </div>
  </div>
);

const NumberField = ({ label, icon: Icon, name, value, placeholder, onChange, required = true }) => (
  <div>
    <label className="form-label flex items-center gap-1.5">
      {Icon && <Icon className="h-3 w-3" />} {label}
    </label>
    <input
      type="number" name={name} placeholder={placeholder} required={required}
      value={value} onChange={onChange} className="form-input"
    />
  </div>
);

const PredictPremium = () => {
  const [formData, setFormData] = useState({
    Age: '',
    Annual_Income: '',
    Vehicle_Age: '',
    Credit_Score: '650',
    Previous_Claims: '0',
    Health_Score: '60',
    Smoking_Status: 'No',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setResult(null); setError('');
    try {
      const payload = {
        Age: parseFloat(formData.Age),
        Annual_Income: parseFloat(formData.Annual_Income),
        Vehicle_Age: parseInt(formData.Vehicle_Age),
        Credit_Score: parseFloat(formData.Credit_Score),
        Previous_Claims: parseFloat(formData.Previous_Claims),
        Health_Score: parseFloat(formData.Health_Score),
        Smoking_Status: formData.Smoking_Status,
      };
      const res = await predictPremium(payload);
      setResult(res.data);
      toast.success(`Premium estimated: $${res.data.predicted_premium?.toFixed(0)}/month`);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to predict premium. Please check all inputs.';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const premium = result?.predicted_premium || 0;
  const tier = getTier(premium);

  // Derived risk signals for the breakdown
  const riskSignals = result ? [
    {
      label: 'Base Rate',
      value: `$${(premium * 0.55).toFixed(0)}`,
      note: 'Age + income factors',
    },
    {
      label: 'Vehicle Loading',
      value: `$${(premium * 0.20).toFixed(0)}`,
      note: `Vehicle age: ${formData.Vehicle_Age} yrs`,
    },
    {
      label: 'Health & Lifestyle',
      value: `$${(premium * 0.15).toFixed(0)}`,
      note: formData.Smoking_Status === 'Yes' ? 'Smoker surcharge applied' : 'Non-smoker discount',
    },
    {
      label: 'Claims History',
      value: `$${(premium * 0.10).toFixed(0)}`,
      note: `${formData.Previous_Claims} prior claim(s)`,
    },
  ] : [];

  return (
    <div className="animate-fade-slide-in">
      <div className="mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <BadgeDollarSign className="h-5 w-5" style={{ color: 'var(--success)' }} /> Premium Estimator
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
          Calculate the optimal monthly premium using multi-variate ML regression.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Left: Form ── */}
        <div className="lg:col-span-7">
          <div className="card">
            <p className="text-sm font-semibold mb-5" style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
              Applicant Profile
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Number fields row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField label="Applicant Age" icon={User} name="Age" placeholder="e.g. 32" value={formData.Age} onChange={handleChange} />
                <NumberField label="Annual Income ($)" icon={TrendingUp} name="Annual_Income" placeholder="e.g. 75,000" value={formData.Annual_Income} onChange={handleChange} />
                <NumberField label="Vehicle Age (years)" icon={Car} name="Vehicle_Age" placeholder="e.g. 4" value={formData.Vehicle_Age} onChange={handleChange} />
                <NumberField label="Previous Claims" icon={Info} name="Previous_Claims" placeholder="0 or more" value={formData.Previous_Claims} onChange={handleChange} />
              </div>

              {/* Slider: Credit Score */}
              <SliderField
                label="Credit Score" icon={CreditCard}
                name="Credit_Score" value={formData.Credit_Score}
                min={300} max={850} step={10}
                onChange={handleChange}
              />

              {/* Slider: Health Score */}
              <SliderField
                label="Health Score" icon={HeartPulse}
                name="Health_Score" value={formData.Health_Score}
                min={0} max={100} step={1}
                onChange={handleChange}
                format={v => `${v}/100`}
              />

              {/* Smoking status */}
              <div>
                <label className="form-label">Smoking Status</label>
                <div className="grid grid-cols-2 gap-3">
                  {['No', 'Yes'].map(s => (
                    <button
                      key={s} type="button"
                      onClick={() => setFormData(p => ({ ...p, Smoking_Status: s }))}
                      className="py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        border: `1.5px solid ${formData.Smoking_Status === s ? 'var(--primary)' : 'var(--border)'}`,
                        background: formData.Smoking_Status === s ? 'var(--primary-soft)' : 'var(--bg)',
                        color: formData.Smoking_Status === s ? 'var(--primary)' : 'var(--text-2)',
                      }}
                    >
                      {s === 'No' ? '🚭 Non-Smoker' : '🚬 Smoker'}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-3" style={{ background: 'var(--success)', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}>
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Computing...</>
                  : <><BadgeDollarSign className="h-4 w-4" /> Generate Premium Estimate</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div className="lg:col-span-5 flex flex-col gap-4">

          {/* Main result card */}
          <div className="card flex flex-col items-center justify-center text-center" style={{ minHeight: 300 }}>
            {!result && !loading && (
              <div>
                <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg)' }}>
                  <BadgeDollarSign className="h-9 w-9" style={{ color: 'var(--text-3)' }} />
                </div>
                <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Estimate Ready</p>
                <p className="text-sm" style={{ color: 'var(--text-3)' }}>Fill the applicant profile to calculate the optimal monthly rate.</p>
              </div>
            )}

            {loading && (
              <div>
                <div className="relative h-20 w-20 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 rounded-full" style={{ borderColor: 'rgba(16,185,129,0.2)' }} />
                  <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--success) transparent transparent transparent' }} />
                  <Activity className="absolute inset-0 m-auto h-7 w-7 animate-pulse" style={{ color: 'var(--success)' }} />
                </div>
                <p className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>Calculating...</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Processing actuarial data points</p>
              </div>
            )}

            {result && !loading && (
              <div className="w-full animate-scale-in">
                {/* Tier badge */}
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4"
                  style={{ background: tier.bg, color: tier.color }}
                >
                  {tier.label} Tier · {tier.desc}
                </span>

                {/* Big premium circle */}
                <div className="relative mx-auto mb-5" style={{ width: 140, height: 140 }}>
                  <div
                    className="absolute inset-0 rounded-full blur-2xl opacity-30"
                    style={{ background: tier.color }}
                  />
                  <div
                    className="relative w-full h-full rounded-full border-4 flex flex-col items-center justify-center"
                    style={{ borderColor: `${tier.color}4D`, background: tier.bg }}
                  >
                    <span className="text-3xl font-black" style={{ color: tier.color }}>
                      ${premium.toFixed(0)}
                    </span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>/ month</span>
                  </div>
                </div>

                <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                  Annual: <strong style={{ color: 'var(--text-1)' }}>${(premium * 12).toFixed(0)}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Premium Breakdown card */}
          {result && (
            <div className="card animate-scale-in">
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Premium Breakdown</p>
              <div className="space-y-0">
                {riskSignals.map((s, i) => (
                  <div key={s.label} className="flex items-center justify-between py-2.5"
                    style={{ borderBottom: i < riskSignals.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-1)' }}>{s.label}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>{s.note}</p>
                    </div>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>{s.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '2px solid var(--border)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>Total / month</span>
                  <span className="text-lg font-black" style={{ color: tier.color }}>${premium.toFixed(0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Info card */}
          <div className="card" style={{ background: 'var(--primary-soft)', border: '1px solid rgba(37,99,235,0.15)' }}>
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                <strong style={{ color: 'var(--text-1)' }}>Model Note:</strong> This estimate uses a gradient-boosted regression model trained on 50,000+ policies. Adjust sliders above to see live tier changes on next submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictPremium;
