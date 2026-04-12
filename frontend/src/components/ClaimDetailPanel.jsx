import React from 'react';
import {
  X, ShieldAlert, ShieldCheck, DollarSign,
  Calendar, Hash, User, Activity
} from 'lucide-react';

const Field = ({ label, value, color }) => (
  <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
    <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)', marginBottom: 4 }}>{label}</p>
    <p className="text-sm font-medium" style={{ color: color || 'var(--text-1)' }}>{value}</p>
  </div>
);

const ClaimDetailPanel = ({ claim, onClose }) => {
  if (!claim) return null;

  const isFraud = (claim.fraud_probability || 0) >= 0.5;
  const probPct = ((claim.fraud_probability || 0) * 100).toFixed(1);
  const dateStr = new Date(claim.created_at).toLocaleDateString('en-US', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease both',
        }}
      />

      {/* Panel */}
      <div
        className="slide-in-right"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
          width: '100%', maxWidth: 420,
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: isFraud ? 'var(--danger-soft)' : 'var(--success-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${isFraud ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}`,
            }}>
              {isFraud
                ? <ShieldAlert style={{ width: 18, height: 18, color: 'var(--danger)' }} />
                : <ShieldCheck  style={{ width: 18, height: 18, color: 'var(--success)' }} />
              }
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>{claim.policy_number}</p>
              <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Claim ID #{claim.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--border)', background: 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-3)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-soft)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Verdict banner */}
        <div style={{
          padding: '14px 24px',
          background: isFraud ? 'var(--danger-soft)' : 'var(--success-soft)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: isFraud ? 'var(--danger)' : 'var(--success)' }}>
            {isFraud ? '⚠️ Fraud Suspected' : '✅ Claim Verified'}
          </span>
          <span className={claim.status === 'Approved' ? 'badge-approved' : claim.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}>
            {claim.status}
          </span>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 24px' }}>

          {/* Fraud probability bar */}
          <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Fraud Probability</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: isFraud ? 'var(--danger)' : 'var(--success)' }}>{probPct}%</p>
            </div>
            <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 99,
                width: `${probPct}%`,
                background: isFraud
                  ? 'linear-gradient(90deg, #f97316, #ef4444)'
                  : 'linear-gradient(90deg, #10b981, #34d399)',
                transition: 'width 0.8s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Low risk (0%)</span>
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>High risk (100%)</span>
            </div>
          </div>

          {/* Fields */}
          <Field
            label="Claim Amount"
            value={`$${(claim.claim_amount || 0).toLocaleString()}`}
            color={claim.status === 'Approved' ? 'var(--success)' : 'var(--danger)'}
          />
          <Field label="Policy Number" value={claim.policy_number} />
          <Field label="Status"        value={claim.status} />
          <Field label="Date Created"  value={dateStr} />
          {claim.agent_id && <Field label="Agent ID" value={`#${claim.agent_id}`} />}
        </div>
      </div>
    </>
  );
};

export default ClaimDetailPanel;
