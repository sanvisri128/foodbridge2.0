// ProfileModal — view and edit user/organization profile with impact overview
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { X, User, Phone, Mail, FileText, CheckCircle, AlertCircle, Award } from 'lucide-react';

export default function ProfileModal({ onClose }) {
  const { user, login, token } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    description: user?.description || '',
  });
  const [impactStats, setImpactStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Fetch personal impact stats
    const fetchImpact = async () => {
      try {
        const { data } = await axios.get('/api/auth/impact');
        setImpactStats(data);
      } catch {
        // ignore
      }
    };
    fetchImpact();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await axios.put('/api/auth/profile', formData);
      login(data.user, token);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-emerald-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl font-bold font-display">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">{user.name}</h2>
              <span className="inline-block mt-1 bg-white/20 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize">
                {user.role === 'provider' ? 'Food Provider Partner' : 'NGO / Relief Partner'}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Personal Impact Card */}
          {impactStats && (
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-primary-700 font-semibold uppercase tracking-wider">
                    {user.role === 'provider' ? 'Meals Donated' : 'Meals Rescued'}
                  </p>
                  <p className="text-xl font-display font-black text-primary-900">
                    {user.role === 'provider'
                      ? impactStats.totalMealsRescued
                      : impactStats.totalMealsDistributed}{' '}
                    portions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500">CO2 Prevented</p>
                <p className="text-sm font-bold text-emerald-700">{impactStats.co2SavedKg} kg</p>
              </div>
            </div>
          )}

          {message.text && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                message.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Organization / Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Registered Email (Cannot be changed)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="input-field pl-10 bg-neutral-100 text-neutral-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                About & Address Details
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={300}
                  placeholder="Primary address, operating hours, notes for volunteers..."
                  className="input-field pl-10 resize-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button type="button" onClick={onClose} className="btn-secondary text-sm py-2 px-4">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary text-sm py-2 px-6 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
