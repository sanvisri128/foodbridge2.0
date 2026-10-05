import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import {
  PlusCircle, Package, MapPin, Clock,
  CheckCircle, AlertCircle, List, Trash2, Utensils, LayoutDashboard
} from 'lucide-react';

const CATEGORIES = [
  { value: 'cooked', label: 'Cooked Food', emoji: '🍛' },
  { value: 'raw', label: 'Raw / Uncooked Grains & Veg', emoji: '🥦' },
  { value: 'packaged', label: 'Packaged Food', emoji: '📦' },
  { value: 'beverages', label: 'Beverages', emoji: '🥤' },
  { value: 'bakery', label: 'Bakery & Bread', emoji: '🍞' },
  { value: 'other', label: 'Other Food Item', emoji: '🍽️' },
];

const DIETARY = [
  { value: 'veg', label: 'Pure Veg', emoji: '🌱' },
  { value: 'non-veg', label: 'Non-Veg', emoji: '🍗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌿' },
  { value: 'egg', label: 'Egg Containing', emoji: '🥚' },
];

const STORAGE = [
  { value: 'room_temp', label: 'Room Temperature (Ambient)' },
  { value: 'hot', label: 'Freshly Cooked & Warm' },
  { value: 'refrigerated', label: 'Refrigerated (< 4°C)' },
  { value: 'frozen', label: 'Frozen (< -18°C)' },
];

function getMinDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export default function DonateFoodPage() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    foodName: '',
    quantity: '',
    servings: '25',
    location: '',
    expiryTime: '',
    category: 'cooked',
    dietaryType: 'veg',
    storageRequirement: 'room_temp',
    notes: '',
  });

  const [safetyConfirmed, setSafetyConfirmed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Provider's existing donations
  const [myDonations, setMyDonations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    try {
      setListLoading(true);
      const { data } = await axios.get('/api/donations/my');
      setMyDonations(data.donations || []);
    } catch (err) {
      console.error('Failed to load donations', err);
    } finally {
      setListLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!safetyConfirmed) {
      setError('Please confirm that the food meets basic hygiene and safety criteria.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/donations', form);
      setSuccess('Donation posted successfully! Nearby NGOs have been alerted.');
      setForm({
        foodName: '',
        quantity: '',
        servings: '25',
        location: '',
        expiryTime: '',
        category: 'cooked',
        dietaryType: 'veg',
        storageRequirement: 'room_temp',
        notes: '',
      });
      fetchMyDonations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post donation.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this donation listing?')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/donations/${id}`);
      setMyDonations((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-neutral-900">
              Donate Surplus Food
            </h1>
            <p className="text-neutral-500 text-sm mt-0.5">
              Posting as <strong className="text-neutral-800">{user?.name}</strong>
            </p>
          </div>
          <Link
            to="/provider-dashboard"
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 self-start sm:self-auto"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Provider Dashboard
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* ─── Donation Form (Left) ─── */}
          <div className="lg:col-span-7">
            <div className="card shadow-sm border border-neutral-200">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-neutral-900">
                    Food Listing Details
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Fill in accurate details to help NGOs coordinate rapid pickups
                  </p>
                </div>
              </div>

              {success && (
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-sm mb-5">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Donation Posted!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">{success}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm mb-5">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="font-medium text-xs">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Food Name */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Food Name / Menu Items *
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      name="foodName"
                      type="text"
                      value={form.foodName}
                      onChange={handleChange}
                      placeholder="e.g. Veg Pulao, Paneer Curry & Rotis"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Quantity & Servings */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Quantity Description *
                    </label>
                    <input
                      name="quantity"
                      type="text"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="e.g. 3 large containers (15 kg)"
                      required
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Estimated Meals (Portions) *
                    </label>
                    <div className="relative">
                      <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        name="servings"
                        type="number"
                        min={1}
                        value={form.servings}
                        onChange={handleChange}
                        placeholder="e.g. 30"
                        required
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Category & Dietary */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Food Category
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="input-field bg-white text-sm"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.emoji} {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Dietary Type
                    </label>
                    <select
                      name="dietaryType"
                      value={form.dietaryType}
                      onChange={handleChange}
                      className="input-field bg-white text-sm"
                    >
                      {DIETARY.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.emoji} {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Storage & Expiry Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Storage Condition
                    </label>
                    <select
                      name="storageRequirement"
                      value={form.storageRequirement}
                      onChange={handleChange}
                      className="input-field bg-white text-sm"
                    >
                      {STORAGE.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                      Pickup Deadline *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        name="expiryTime"
                        type="datetime-local"
                        value={form.expiryTime}
                        onChange={handleChange}
                        min={getMinDateTime()}
                        required
                        className="input-field pl-10 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Pickup Address / Landmark *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      name="location"
                      type="text"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Spice Kitchen, 45 MG Road, Koramangala, Bangalore"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Handling Notes & Instructions (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={2}
                    maxLength={500}
                    placeholder="Allergens, BYO containers required, pickup back gate instructions..."
                    className="input-field resize-none text-sm"
                  />
                </div>

                {/* Food Safety Declaration */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
                  <input
                    id="safety"
                    type="checkbox"
                    checked={safetyConfirmed}
                    onChange={(e) => setSafetyConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <label htmlFor="safety" className="text-xs text-emerald-950 font-medium cursor-pointer">
                    <strong>Food Safety Declaration:</strong> I confirm this food is hygienic, edible,
                    freshly prepared within safe time limits, and stored in accordance with food safety standards.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-base shadow-md disabled:opacity-50"
                >
                  {loading ? 'Publishing Food Donation...' : 'Publish Food Donation'}
                </button>
              </form>
            </div>
          </div>

          {/* ─── Recent Donations Sidebar (Right) ─── */}
          <div className="lg:col-span-5">
            <div className="card shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg text-neutral-900 flex items-center gap-2">
                  <List className="w-5 h-5 text-primary-600" />
                  Your Active Listings
                </h2>
                <span className="text-xs font-bold bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full">
                  {myDonations.length} total
                </span>
              </div>

              {listLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : myDonations.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-neutral-100">
                  <Package className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-600 text-sm font-semibold">No donations yet</p>
                  <p className="text-neutral-400 text-xs mt-0.5">
                    Your posted food listings will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {myDonations.map((d) => {
                    const isExpired = new Date(d.expiryTime) < new Date();
                    const isCompleted = d.status === 'completed';

                    return (
                      <div
                        key={d._id}
                        className={`border rounded-2xl p-3.5 space-y-2 transition-all ${
                          isCompleted
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : d.claimed
                            ? 'border-primary-300 bg-primary-50/60'
                            : isExpired
                            ? 'border-neutral-200 bg-neutral-50 opacity-60'
                            : 'border-neutral-200 bg-white shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-neutral-900 leading-snug">
                            {d.foodName}
                          </h4>
                          {!d.claimed && !isExpired && (
                            <button
                              onClick={() => handleDelete(d._id)}
                              disabled={deletingId === d._id}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                          <span>{d.quantity}</span>
                          <span>·</span>
                          <span>~{d.servings || 10} meals</span>
                          <span>·</span>
                          <span className="truncate max-w-[140px]">{d.location}</span>
                        </div>

                        {/* Status banner */}
                        <div className="pt-2 border-t border-neutral-100/80 flex items-center justify-between text-xs">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.claimed
                                ? 'bg-amber-100 text-amber-800'
                                : isExpired
                                ? 'bg-neutral-200 text-neutral-600'
                                : 'bg-primary-100 text-primary-800'
                            }`}
                          >
                            {isCompleted
                              ? 'Handover Completed'
                              : d.claimed
                              ? `Claimed by ${d.claimedBy?.name || 'NGO'}`
                              : isExpired
                              ? 'Expired'
                              : 'Available for Claim'}
                          </span>

                          {d.pickupCode && d.claimed && !isCompleted && (
                            <span className="font-mono bg-white px-2 py-0.5 rounded border border-neutral-200 font-bold text-neutral-700">
                              OTP: {d.pickupCode}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
