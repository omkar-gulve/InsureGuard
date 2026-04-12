import React, { useEffect, useState } from 'react';
import { getClaims } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, ShieldAlert, ShieldCheck, DollarSign } from 'lucide-react';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const mockBarData = [
  { month: 'Jan', fraudRate: 18, total: 52 },
  { month: 'Feb', fraudRate: 22, total: 44 },
  { month: 'Mar', fraudRate: 15, total: 63 },
  { month: 'Apr', fraudRate: 27, total: 49 },
  { month: 'May', fraudRate: 13, total: 71 },
  { month: 'Jun', fraudRate: 31, total: 58 },
  { month: 'Jul', fraudRate: 21, total: 66 },
  { month: 'Aug', fraudRate: 17, total: 54 },
];

const mockPremiumData = [
  { range: '<$2k', count: 32 },
  { range: '$2-5k', count: 58 },
  { range: '$5-10k', count: 74 },
  { range: '$10-20k', count: 51 },
  { range: '$20-50k', count: 38 },
  { range: '>$50k', count: 14 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs shadow-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--text-1)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

const KpiCard = ({ label, value, trend, icon: Icon, iconColor, iconBg }) => (
  <div className="card-hover" style={{ padding: '16px 20px' }}>
    <div className="flex items-center justify-between mb-3">
      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: iconBg }}>
        <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" style={{ color: iconColor }} />
      </div>
      {trend >= 0
        ? <span className="trend-up text-[11px]"><ArrowUpRight className="h-3 w-3" />{trend}%</span>
        : <span className="trend-down text-[11px]"><ArrowDownRight className="h-3 w-3" />{Math.abs(trend)}%</span>
      }
    </div>
    <p className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{value}</p>
    <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{label}</p>
  </div>
);

const Reports = () => {
  const [claims, setClaims] = useState([]);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    getClaims()
      .then(res => setClaims(res.data))
      .catch(() => setClaims([]));
  }, []);

  const totalClaims = claims.length;
  const fraudClaims = claims.filter(c => (c.fraud_probability || 0) >= 0.5).length;
  const approvedClaims = claims.filter(c => c.status === 'Approved').length;
  const totalValue = claims.reduce((s, c) => s + (c.claim_amount || 0), 0);

  const gridLineColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const axisTickColor = isDark ? '#6B7280' : '#9CA3AF';

  const pieColors = ['var(--primary)', 'var(--danger)', 'var(--warning)'];
  const statusPie = [
    { name: 'Approved', value: approvedClaims },
    { name: 'Rejected', value: fraudClaims },
    { name: 'Pending', value: Math.max(0, totalClaims - approvedClaims - fraudClaims) },
  ];

  return (
    <div className="animate-fade-slide-in space-y-5">
      <div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Analytics & Reports</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>A summary of system metrics, fraud patterns, and claim distributions.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Claims" value={totalClaims.toLocaleString()} trend={12.4} icon={ShieldCheck} iconColor="var(--primary)" iconBg="rgba(37,99,235,0.1)" />
        <KpiCard label="Fraud Detected" value={fraudClaims} trend={-4.1} icon={ShieldAlert} iconColor="var(--danger)" iconBg="rgba(239,68,68,0.1)" />
        <KpiCard label="Approved Claims" value={approvedClaims} trend={8.3} icon={TrendingUp} iconColor="var(--success)" iconBg="rgba(16,185,129,0.1)" />
        <KpiCard label="Total Claim Value" value={`$${totalValue.toLocaleString()}`} trend={5.7} icon={DollarSign} iconColor="var(--warning)" iconBg="rgba(245,158,11,0.1)" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Monthly Fraud Rate Bar Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Monthly Fraud Rate</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>Number of fraud flags per month</p>
            </div>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--bg)', color: 'var(--text-3)', border: '1px solid var(--border)' }}>
              {new Date().getFullYear()}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid strokeDasharray="4 4" stroke={gridLineColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: axisTickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisTickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="total" name="Total Claims" fill={isDark ? 'rgba(59,130,246,0.2)' : 'rgba(37,99,235,0.1)'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="fraudRate" name="Fraud Cases" fill="var(--danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution Pie */}
        <div className="card flex flex-col">
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Claim Status Split</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>Distribution of outcomes</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                {statusPie.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 500 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
          {/* Quick stats */}
          <div className="mt-auto pt-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            {statusPie.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: pieColors[i] }} />
                  <span style={{ color: 'var(--text-2)' }}>{s.name}</span>
                </span>
                <span className="font-semibold" style={{ color: 'var(--text-1)' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Claim Amount Distribution */}
        <div className="card">
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Claim Amount Distribution</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>Number of claims by value range</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mockPremiumData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke={gridLineColor} vertical={false} />
              <XAxis dataKey="range" tick={{ fill: axisTickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisTickColor, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Claims" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fraud Trend Area */}
        <div className="card">
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Fraud Trend Over Time</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>Monthly fraud rate percentage</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={mockBarData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gFraudR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity={isDark ? 0.3 : 0.15} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke={gridLineColor} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: axisTickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisTickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="fraudRate" name="Fraud Cases" stroke="var(--danger)" fill="url(#gFraudR)" strokeWidth={2.5}
                dot={{ r: 3, fill: 'var(--surface)', strokeWidth: 2, stroke: '#EF4444' }}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Monthly Summary</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Month', 'Total Claims', 'Fraud Flags', 'Fraud Rate', 'Approved'].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockBarData.map((row, i) => (
                <tr key={row.month}
                  style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-soft)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: 'var(--text-1)' }}>{row.month}</td>
                  <td className="px-5 py-3 text-sm" style={{ color: 'var(--text-2)' }}>{row.total}</td>
                  <td className="px-5 py-3 text-sm font-medium" style={{ color: 'var(--danger)' }}>{row.fraudRate}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(row.fraudRate / row.total * 100).toFixed(0)}%`, background: 'var(--danger)' }} />
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-3)' }}>{(row.fraudRate / row.total * 100).toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm" style={{ color: 'var(--success)' }}>{row.total - row.fraudRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
