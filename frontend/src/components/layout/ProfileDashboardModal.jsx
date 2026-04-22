import React, { useState, useEffect } from 'react';
import { X, Save, User, Mail, Phone, Camera, LogOut, CheckCircle2, ShieldCheck, Crown } from 'lucide-react';
import { updateProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ProfileDashboardModal = ({ isOpen, onClose }) => {
  const { user, setUser, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone_number: '',
    profile_image_url: ''
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        full_name: user.full_name || '',
        phone_number: user.phone_number || '',
        profile_image_url: user.profile_image_url || ''
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateProfile(formData);
      setUser(res.data);
      toast.success('Profile updated successfully! ✨');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile. ' + (err.response?.data?.detail || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const modalBackdropClass = isDark
    ? 'bg-black/70 backdrop-blur-md'
    : 'bg-slate-900/40 backdrop-blur-sm';

  const modalSurfaceClass = isDark
    ? 'bg-gradient-to-br from-[#12141c] to-[#0A0C10] border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.15)] text-white'
    : 'bg-white/95 border border-slate-200 shadow-2xl text-slate-900';

  const cardClass = isDark
    ? 'bg-white/5 border border-white/10 shadow-lg'
    : 'bg-slate-50 border border-slate-200 shadow-sm';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all ${modalBackdropClass}`}>
      {/* Click-away backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Dashboard Modal */}
      <div 
        className={`relative w-full max-w-5xl h-[85vh] sm:h-[80vh] rounded-3xl overflow-hidden flex flex-col md:flex-row transition-transform duration-300 transform scale-100 ${modalSurfaceClass}`}
      >
        {/* Close Button top-right absolute */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full z-10 bg-black/10 hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left Column: Overview Presentation */}
        <div className={`w-full md:w-2/5 p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r ${isDark ? 'border-white/10 bg-black/20' : 'border-slate-200 bg-slate-50/50'}`}>
          <div className="relative group mb-6">
            <div 
              className={`w-40 h-40 rounded-full flex items-center justify-center text-5xl font-bold shadow-2xl overflow-hidden border-4 transition-transform group-hover:scale-105 duration-300 ${isDark ? 'border-indigo-500/50 bg-indigo-900/40 text-indigo-200' : 'border-blue-500 bg-blue-100 text-blue-600'}`}
            >
              {formData.profile_image_url ? (
                <img src={formData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                formData.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
              <Camera className="w-8 h-8 text-white" />
            </div>
            
            {user?.role === 'admin' && (
              <div className="absolute bottom-2 right-2 bg-yellow-500 text-yellow-950 p-2 rounded-full border-2 border-white shadow-lg" title="Admin">
                <Crown className="w-5 h-5" />
              </div>
            )}
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-2">
            {formData.full_name || formData.username}
          </h2>
          <div className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize tracking-widest ${isDark ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200'}`}>
            {user?.role || 'Agent'}
          </div>

          <div className="mt-10 w-full grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl flex flex-col items-center justify-center ${cardClass}`}>
              <span className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Status</span>
              <span className="flex items-center gap-2 text-green-500 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Active
              </span>
            </div>
            <div className={`p-4 rounded-2xl flex flex-col items-center justify-center ${cardClass}`}>
              <span className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Security</span>
              <span className="flex items-center gap-2 text-indigo-500 font-bold">
                <ShieldCheck className="w-4 h-4" /> Verified
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="mt-auto pt-8 flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

        {/* Right Column: Editor */}
        <div className="w-full md:w-3/5 p-8 flex flex-col overflow-hidden h-full">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">Command Center</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Manage your account settings and preferences.</p>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 space-y-6">
            <form id="profile-form-dashboard" onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info Card */}
              <div className={`p-6 rounded-2xl ${cardClass}`}>
                <h4 className="text-sm font-bold tracking-wider uppercase mb-4 opacity-70">Personal Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold mb-2 opacity-80">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input 
                        type="text" name="full_name"
                        value={formData.full_name} onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-black/30 border border-white/10' : 'bg-white border border-slate-300'}`}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 opacity-80">Username</label>
                    <div className="relative">
                      <input 
                        type="text" name="username"
                        value={formData.username} onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-black/30 border border-white/10' : 'bg-white border border-slate-300'}`}
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className={`p-6 rounded-2xl ${cardClass}`}>
                <h4 className="text-sm font-bold tracking-wider uppercase mb-4 opacity-70">Contact Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold mb-2 opacity-80">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input 
                        type="email" name="email"
                        value={formData.email} onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-black/30 border border-white/10' : 'bg-white border border-slate-300'}`}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 opacity-80">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input 
                        type="tel" name="phone_number"
                        value={formData.phone_number} onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-black/30 border border-white/10' : 'bg-white border border-slate-300'}`}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Avatar URL Card */}
              <div className={`p-6 rounded-2xl ${cardClass}`}>
                <label className="block text-xs font-semibold mb-2 opacity-80">Profile Image URL</label>
                <input 
                  type="url" name="profile_image_url"
                  value={formData.profile_image_url} onChange={handleChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-black/30 border border-white/10' : 'bg-white border border-slate-300'}`}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </form>
          </div>

          <div className="mt-6 pt-6 border-t flex items-center justify-end" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
             <button 
                type="button"
                onClick={onClose}
                className={`px-6 py-3 rounded-xl mr-4 font-semibold transition-colors ${isDark ? 'hover:bg-white/5 text-gray-300' : 'hover:bg-slate-100 text-slate-600'}`}
             >
                Cancel
             </button>
             <button 
                type="submit" 
                form="profile-form-dashboard"
                disabled={loading}
                className="btn-primary shadow-lg shadow-blue-500/30 flex items-center px-8 py-3 rounded-xl font-bold"
             >
                {loading ? (
                  <span className="animate-spin w-5 h-5 border-2 border-white rounded-full border-t-transparent mr-2" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Saving...' : 'Save Changes'}
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileDashboardModal;
