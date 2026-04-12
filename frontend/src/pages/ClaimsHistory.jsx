import React, { useState, useMemo, useEffect } from 'react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { getClaims } from '../services/api';
import ClaimDetailPanel from '../components/ClaimDetailPanel';
import { 
  ShieldAlert, Search, Filter, Download, Upload, 
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  FileSpreadsheet
} from 'lucide-react';

const ClaimsHistory = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const rowsPerPage = parseInt(localStorage.getItem('ig-rows-per-page') || '10');

  useEffect(() => {
    getClaims()
      .then(res => setClaims(res.data))
      .catch(() => setClaims([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let data = [...claims];
    if (search) data = data.filter(c =>
      c.policy_number?.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'All') data = data.filter(c => c.status === statusFilter);
    data.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (av === undefined) return 1;
      if (bv === undefined) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [claims, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = key => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const exportCSV = () => {
    const headers = ['Policy #', 'Amount', 'Status', 'Fraud Risk', 'Date'];
    const rows = filtered.map(c => [
      c.policy_number,
      c.claim_amount,
      c.status,
      `${((c.fraud_probability || 0) * 100).toFixed(1)}%`,
      new Date(c.created_at).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'claims_export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === 'asc'
      ? <ChevronUp className="h-3 w-3" style={{ color: 'var(--primary)' }} />
      : <ChevronDown className="h-3 w-3" style={{ color: 'var(--primary)' }} />;
  };

  return (
    <div className="animate-fade-slide-in space-y-4">
      {/* Claim Detail Panel */}
      <ClaimDetailPanel claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>Claims History</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
            {filtered.length} claim{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <button onClick={exportCSV} className="btn-primary">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters bar */}
      <div className="card" style={{ padding: '14px 16px' }}>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1" style={{ minWidth: 200 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-3)' }} />
            <input
              type="text"
              placeholder="Search by policy number..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="form-input"
              style={{ paddingLeft: 36 }}
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1">
            <Filter className="h-4 w-4" style={{ color: 'var(--text-3)' }} />
            {['All', 'Approved', 'Rejected', 'Pending'].map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: statusFilter === s ? 'var(--primary)' : 'var(--bg)',
                  color: statusFilter === s ? 'white' : 'var(--text-2)',
                  border: `1px solid ${statusFilter === s ? 'var(--primary)' : 'var(--border)'}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="py-20 text-center text-sm" style={{ color: 'var(--text-3)' }}>Loading claims...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <ShieldAlert className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--text-3)' }} />
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>No claims match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                  {[
                    { label: 'Policy #', key: 'policy_number' },
                    { label: 'Amount', key: 'claim_amount' },
                    { label: 'Status', key: 'status' },
                    { label: 'Fraud Risk', key: 'fraud_probability' },
                    { label: 'Date', key: 'created_at' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none"
                      style={{ color: 'var(--text-3)', whiteSpace: 'nowrap' }}
                    >
                      <span className="flex items-center gap-1.5">
                        {col.label} <SortIcon col={col.key} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.map((claim, i) => (
                  <tr
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-soft)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: `hsl(${(i * 53 + 210) % 360}, 65%, 50%)` }}>
                          {claim.policy_number?.charAt(0) || 'P'}
                        </div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{claim.policy_number}</span>
                      </div>
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
                        <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full"
                            style={{
                              width: `${((claim.fraud_probability || 0) * 100).toFixed(0)}%`,
                              background: (claim.fraud_probability || 0) >= 0.5 ? 'var(--danger)' : 'var(--success)'
                            }} />
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>
                          {((claim.fraud_probability || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--text-2)' }}>
                      {new Date(claim.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Showing {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-1.5 disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className="h-8 w-8 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: pg === page ? 'var(--primary)' : 'transparent',
                      color: pg === page ? 'white' : 'var(--text-2)',
                    }}
                  >
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-1.5 disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsHistory;
