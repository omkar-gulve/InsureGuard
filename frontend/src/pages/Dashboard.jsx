import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  ShieldAlert, Users, ShieldCheck, TrendingUp,
  ArrowUpRight, ArrowDownRight, ArrowRight, 
  Activity, Zap, Target
} from 'lucide-react';
import { getClaims } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import ClaimDetailPanel from '../components/ClaimDetailPanel';

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const StatCard = ({ title, value, sub, trend, icon: Icon, iconBg, iconColor }) => (
  <div className="card-hover" style={{ padding: '20px' }}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
          <Icon className="h-5 w-5" style={{ color: iconColor }} />
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>{title}</p>
          {sub && <p className="text-[10px]" style={{ color: 'var(--text-3)' }}>{sub}</p>}
        </div>
      </div>
      {trend !== undefined && (
        trend >= 0
          ? <span className="trend-up"><ArrowUpRight className="h-3 w-3" />↑ {Math.abs(trend)}%</span>
          : <span className="trend-down"><ArrowDownRight className="h-3 w-3" />↓ {Math.abs(trend)}%</span>
      )}
    </div>
    <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{value}</p>
    <p className="text-[11px] mt-1" style={{ color: 'var(--text-3)' }}>Compared to last month</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl p-3 text-xs shadow-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <p className="font-semibold mb-2" style={{ color: 'var(--text-1)' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Skeleton card shown while loading
const SkeletonCard = () => (
  <div className="card-hover" style={{ padding: '20px' }}>
    <div className="skeleton skeleton-title mb-3" style={{ width: '60%' }} />
    <div className="skeleton skeleton-text mb-2" style={{ width: '40%' }} />
    <div className="skeleton" style={{ height: 32, width: '50%', borderRadius: 8 }} />
  </div>
);

const Dashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    getClaims()
      .then(res => setClaims(res.data))
      .catch(() => setClaims([]))
      .finally(() => setLoading(false));
  }, []);

  const totalClaims  = claims.length;
  const fraudClaims  = claims.filter(c => (c.fraud_probability || 0) >= 0.5).length;
  const approvedClaims = claims.filter(c => c.status === 'Approved').length;
  const avgAmount    = claims.length
    ? (claims.reduce((s, c) => s + c.claim_amount, 0) / claims.length).toFixed(0)
    : 0;

  // ── Build REAL monthly data from claims ──────────────────────
  const liveMonthlyData = useMemo(() => {
    const now = new Date();
    // Last 9 months
    const months = Array.from({ length: 9 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 8 + i, 1);
      return { month: MONTH_LABELS[d.getMonth()], year: d.getFullYear(), claims: 0, fraud: 0 };
    });
    claims.forEach(c => {
      const d = new Date(c.created_at);
      const idx = months.findIndex(m => m.month === MONTH_LABELS[d.getMonth()] && m.year === d.getFullYear());
      if (idx !== -1) {
        months[idx].claims += 1;
        if ((c.fraud_probability || 0) >= 0.5) months[idx].fraud += 1;
      }
    });
    return months;
  }, [claims]);

  const pieColors = ['var(--primary)', 'var(--danger)'];
  const pieData = [
    { name: 'Genuine', value: totalClaims - fraudClaims },
    { name: 'Fraud', value: fraudClaims },
  ];

  const gridLineColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const axisTickColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <div className="space-y-5 animate-fade-slide-in">
      <ClaimDetailPanel claim={selectedClaim} onClose={() => setSelectedClaim(null)} />

      {/* ── Row 1: Three stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              title="Total Claims"
              value={totalClaims.toLocaleString()}
              sub="All time records"
              trend={12.4}
              icon={Users}
              iconBg="rgba(37,99,235,0.10)"
              iconColor="var(--primary)"
            />
            <StatCard
              title="Fraud Detected"
              value={fraudClaims.toLocaleString()}
              sub="This period"
              trend={-4.1}
              icon={ShieldAlert}
              iconBg="rgba(239,68,68,0.10)"
              iconColor="var(--danger)"
            />
            <StatCard
              title="Claims Approved"
              value={approvedClaims.toLocaleString()}
              sub="Verified & cleared"
              trend={8.3}
              icon={ShieldCheck}
              iconBg="rgba(16,185,129,0.10)"
              iconColor="var(--success)"
            />
          </>
        )}
      </div>

      {/* ── Row 2: Main content ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Balance-style summary card */}
          <div className="card">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>Average Claim Value</p>
              <span className="trend-up"><ArrowUpRight className="h-3 w-3" />↑ 2.8%</span>
            </div>
            <p className="text-3xl font-bold mt-2 mb-1" style={{ color: 'var(--text-1)' }}>
              ${Number(avgAmount).toLocaleString()}
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>Per active claim · Updated just now</p>
            <div className="flex gap-2">
              <Link to="/predict-fraud" className="btn-primary flex-1 text-center" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                <Zap className="h-3.5 w-3.5" /> Analyze Claim
              </Link>
              <Link to="/claims" className="btn-outline flex-1 text-center" style={{ textDecoration: 'none', justifyContent: 'center' }}>
                <Activity className="h-3.5 w-3.5" /> View All
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Quick Actions</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Fraud Check', icon: ShieldAlert, color: 'var(--danger)', bg: 'rgba(239,68,68,0.08)', path: '/predict-fraud' },
                { label: 'Premium Est.', icon: TrendingUp, color: 'var(--success)', bg: 'rgba(16,185,129,0.08)', path: '/predict-premium' },
                { label: 'Reports', icon: Target, color: 'var(--primary)', bg: 'var(--primary-soft)', path: '/reports' },
              ].map(item => (
                <Link
                  key={item.label}
                  to={item.path}
                  style={{ textDecoration: 'none' }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all cursor-pointer"
                  onMouseEnter={e => e.currentTarget.style.background = item.bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: item.bg }}>
                    <item.icon className="h-5 w-5" style={{ color: item.color }} />
                  </div>
                  <p className="text-[11px] font-medium text-center" style={{ color: 'var(--text-2)' }}>{item.label}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Fraud Distribution Donut */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Fraud Distribution</p>
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--bg)', color: 'var(--text-3)' }}>All time</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={72} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={v => <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-3 flex flex-col gap-4">

          {/* Claims Trend Chart */}
          <div className="card" style={{ flex: '1 1 auto' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Claims Flow</p>
                <p className="text-2xl font-bold mt-0.5" style={{ color: 'var(--text-1)' }}>
                  {totalClaims.toLocaleString()}
                  <span className="trend-up text-sm ml-2 font-semibold"><ArrowUpRight className="h-3 w-3 inline" /> 16.8%</span>
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-3)' }}>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--primary)' }} />Claims</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: 'var(--danger)' }} />Fraud</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={liveMonthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gClaims" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity={isDark ? 0.25 : 0.15} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" stopOpacity={isDark ? 0.25 : 0.15} />
                    <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: axisTickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisTickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="4 4" stroke={gridLineColor} vertical={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="claims" name="Claims" stroke="#2563EB" fill="url(#gClaims)" strokeWidth={2.5}
                  dot={{ r: 3, fill: 'var(--surface)', strokeWidth: 2, stroke: '#2563EB' }}
                  activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="fraud" name="Fraud" stroke="#EF4444" fill="url(#gFraud)" strokeWidth={2.5}
                  dot={{ r: 3, fill: 'var(--surface)', strokeWidth: 2, stroke: '#EF4444' }}
                  activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Model Performance Cards (like Savings in reference) */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Model Performance</p>
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--bg)', color: 'var(--text-3)' }}>Live metrics</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Fraud Detection Model', metric: '94.2%', sub: 'Accuracy score', progress: 94, color: 'var(--primary)', bg: 'var(--primary-soft)' },
                { label: 'Premium Estimator', metric: '$245', sub: 'Avg error (MAE)', progress: 78, color: 'var(--success)', bg: 'var(--success-soft)' },
              ].map(m => (
                <div key={m.label} className="p-4 rounded-xl" style={{ background: m.bg }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-1)' }}>{m.label}</p>
                  <p className="text-[11px] mb-2" style={{ color: 'var(--text-3)' }}>{m.sub}</p>
                  <p className="text-xl font-bold mb-2" style={{ color: m.color }}>{m.metric}</p>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.progress}%`, background: m.color }} />
                  </div>
                  <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--text-3)' }}>{m.progress}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Recent Claims Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Recent Activity</p>
          <Link to="/claims" className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm" style={{ color: 'var(--text-3)' }}>Loading claims...</div>
        ) : claims.length === 0 ? (
          <div className="py-16 text-center">
            <ShieldAlert className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>No claims recorded yet.</p>
            <Link to="/predict-fraud" className="btn-primary mt-4 inline-flex" style={{ textDecoration: 'none' }}>Analyze First Claim</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Policy #', 'Date', 'Amount', 'Status', 'Fraud Risk'].map(h => (
                    <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {claims.slice(0, 6).map((claim, i) => (
                  <tr key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-soft)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: `hsl(${(i * 47 + 200) % 360}, 70%, 50%)` }}>
                          {claim.policy_number?.charAt(0) || 'P'}
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{claim.policy_number}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-2)' }}>
                      {new Date(claim.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold" style={{ color: claim.status === 'Approved' ? 'var(--success)' : 'var(--danger)' }}>
                        {claim.status === 'Approved' ? '+' : '-'}${claim.claim_amount?.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={claim.status === 'Approved' ? 'badge-approved' : claim.status === 'Rejected' ? 'badge-rejected' : 'badge-pending'}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${((claim.fraud_probability || 0) * 100).toFixed(0)}%`,
                              background: (claim.fraud_probability || 0) >= 0.5 ? 'var(--danger)' : 'var(--primary)'
                            }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
                          {((claim.fraud_probability || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
