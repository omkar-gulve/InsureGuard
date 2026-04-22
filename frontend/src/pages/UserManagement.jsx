import React, { useState, useEffect } from 'react';
import { Users, Crown, Mail, ShieldAlert, BadgeDollarSign, Trash2, Search, AlertTriangle, Eye, X, Phone, Calendar } from 'lucide-react';
import { getAllUsers, deleteUser } from '../services/api';
import toast from 'react-hot-toast';

// Custom Modal Component for Premium User Details
const UserDetailsModal = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div 
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100 opacity-100"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-strong)' }}
      >
        {/* Soft elegant gradient ceiling */}
        <div 
          className="h-32 w-full absolute top-0 left-0"
          style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.15) 0%, transparent 100%)' }}
        />
        
        <div className="relative p-6">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all hover:bg-white/10"
            style={{ color: 'var(--text-3)' }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Row: Avatar + High-level */}
          <div className="flex flex-col items-center mt-2 mb-6">
            <div 
              className="h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-xl overflow-hidden border-4 z-10"
              style={{ background: user.role === 'admin' ? 'var(--warning-soft)' : 'var(--primary)', borderColor: 'var(--surface-raised)', color: user.role === 'admin' ? 'var(--warning)' : 'white' }}
            >
              {user.profile_image_url ? (
                <img src={user.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            
            <h2 className="mt-3 text-xl font-bold" style={{ color: 'var(--text-1)' }}>
              {user.full_name || `@${user.username}`}
            </h2>
            <p className="text-sm font-medium mt-1 mb-3" style={{ color: 'var(--text-3)' }}>
              {user.full_name ? `@${user.username}` : 'Registered User'}
            </p>

            {user.role === 'admin' ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(252,211,77,0.15)]" style={{ background: 'rgba(252,211,77,0.15)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.3)' }}>
                <Crown className="w-3.5 h-3.5" />
                SYSTEM ADMINISTRATOR
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.15)]" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <ShieldAlert className="w-3.5 h-3.5" />
                INSURANCE AGENT
              </div>
            )}
          </div>

          {/* Details Block */}
          <div className="rounded-xl p-4 space-y-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                <Mail className="w-4 h-4 opacity-70" style={{ color: 'var(--text-2)' }} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Email</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{user.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                <Phone className="w-4 h-4 opacity-70" style={{ color: 'var(--text-2)' }} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Phone Number</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{user.phone_number || 'No phone provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ background: 'var(--surface)' }}>
                <BadgeDollarSign className="w-4 h-4 opacity-70" style={{ color: 'var(--text-2)' }} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Claims Audited</p>
                <p className="text-sm font-bold" style={{ color: user.claims_count > 0 ? 'var(--primary)' : 'var(--text-2)' }}>
                  {user.claims_count} total claims processed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users. You might not have Admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Are you sure you want to permanently delete user @${username}?`)) {
      try {
        await deleteUser(id);
        toast.success(`User ${username} deleted successfully`);
        setUsers(users.filter((u) => u.id !== id));
      } catch (err) {
        toast.error('Failed to delete user.');
      }
    }
  };

  const filteredUsers = users.filter((u) => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto h-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>User Management</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Handle system access and monitor agent claim loads.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-3)' }} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 w-64 text-sm py-2"
            />
          </div>
          <button className="btn-secondary py-2" onClick={fetchUsers}>
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 card overflow-hidden flex flex-col p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: 'var(--surface-raised)', borderBottom: '1px solid var(--border)' }}>
                <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Agent</th>
                <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Contact</th>
                <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--text-3)' }}>System Role</th>
                <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-center" style={{ color: 'var(--text-3)' }}>Claims Audited</th>
                <th className="py-4 px-5 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--text-3)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-sm" style={{ color: 'var(--text-3)' }}>
                    Loading directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-sm" style={{ color: 'var(--text-3)' }}>
                    {searchQuery ? 'No users match your search.' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-white/5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold relative" style={{ background: u.role === 'admin' ? 'var(--warning-soft)' : 'var(--primary)', color: u.role === 'admin' ? 'var(--warning)' : 'white' }}>
                          {u.profile_image_url ? (
                            <img src={u.profile_image_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            u.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{u.username}</p>
                          {u.full_name && <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{u.full_name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-2)' }}>
                          <Mail className="w-3.5 h-3.5 opacity-70" />
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center">
                      {u.role === 'admin' ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(252,211,77,0.15)', color: '#FCD34D', border: '1px solid rgba(252,211,77,0.3)' }}>
                          <Crown className="w-3.5 h-3.5" />
                          ADMIN
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--primary-soft)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.3)' }}>
                          <ShieldAlert className="w-3.5 h-3.5" />
                          AGENT
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span className="font-bold text-lg" style={{ color: 'var(--text-1)' }}>{u.claims_count}</span>
                    </td>
                    <td className="py-3 px-5 text-right">
                      {u.role !== 'admin' ? (
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => setSelectedUser(u)}
                            title="View Profile"
                            className="p-2 rounded-lg transition-colors hover:bg-white/10"
                            style={{ color: 'var(--text-2)' }}
                          >
                            <Eye className="w-[18px] h-[18px]" />
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id, u.username)}
                            title="Delete Agent"
                            className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                            style={{ color: 'var(--error)' }}
                          >
                            <Trash2 className="w-[18px] h-[18px]" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => setSelectedUser(u)}
                            title="View Profile"
                            className="p-2 rounded-lg transition-colors hover:bg-white/10"
                            style={{ color: 'var(--warning)' }}
                          >
                            <Eye className="w-[18px] h-[18px]" />
                          </button>
                          <button disabled className="p-2 opacity-30 cursor-not-allowed text-white">
                             <Trash2 className="w-[18px] h-[18px]" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserDetailsModal 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
      />
    </div>
  );
};

export default UserManagement;
