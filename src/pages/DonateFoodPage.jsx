// DonateFoodPage — form for providers to post a food donation
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import {
  PlusCircle, Package, MapPin, Clock, FileText,
  Tag, CheckCircle, AlertCircle, List, Trash2, Edit3
} from 'lucide-react';

// Category options that match the Mongoose enum
const CATEGORIES = [
  { value: 'cooked',    label: 'Cooked Food',      emoji: '🍛' },
  { value: 'raw',       label: 'Raw / Uncooked',   emoji: '🥦' },
  { value: 'packaged',  label: 'Packaged Food',    emoji: '📦' },
  { value: 'beverages', label: 'Beverages',        emoji: '🥤' },
  { value: 'other',     label: 'Other',            emoji: '🍽️' },
];

// Get the minimum datetime string for the expiry picker (current time)
function getMinDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export default function DonateFoodPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    foodName: '',
    quantity: '',
    location: '',
    expiryTime: '',
    category: 'cooked',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // List of all donations by this provider
  const [myDonations, setMyDonations] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Load the provider's own donations on mount
  useEffect(() => {
    fetchMyDonations();
  }, []);

  const fetchMyDonations = async () => {
    try {
      setListLoading(true);
      const { data } = await axios.get('/api/donations/my');
      setMyDonations(data.donations);
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
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/donations', form);
      setSuccess('Donation posted! NGOs can now see and claim it.');
      // Reset form
      setForm({ foodName: '', quantity: '', location: '', expiryTime: '', category: 'cooked', notes: '' });
      // Refresh the list
      fetchMyDonations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post donation.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this donation?')) return;
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-neutral-900 mb-1">Donate Food</h1>
          <p className="text-neutral-500">
            Posting as <strong className="text-neutral-700">{user?.name}</strong>
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* ─── Donation form ─────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="card">
              <h2 className="font-display font-bold text-xl text-neutral-900 mb-6 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary-600" />
                New Donation
              </h2>

              {success && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {success}
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Food name */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Food Name *
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      name="foodName"
                      type="text"
                      value={form.foodName}
                      onChange={handleChange}
                      placeholder="e.g. Biryani and Dal"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Quantity + Category row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Quantity *</label>
                    <input
                      name="quantity"
                      type="text"
                      value={form.quantity}
                      onChange={handleChange}
                      placeholder="e.g. 30 meals"
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="input-field pl-10 appearance-none bg-white"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Pickup Location *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      name="location"
                      type="text"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. 45 MG Road, Bangalore"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Expiry time */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
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
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Additional Notes <span className="text-neutral-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      maxLength={500}
                      placeholder="Allergen info, packaging details, special instructions..."
                      className="input-field pl-10 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-base disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </span>
                  ) : (
                    'Post Donation'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* ─── My donations list ─────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="font-display font-bold text-xl text-neutral-900 mb-4 flex items-center gap-2">
                <List className="w-5 h-5 text-primary-600" />
                My Donations
              </h2>

              {listLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                </div>
              ) : myDonations.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">No donations yet. Post your first one!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {myDonations.map((d) => (
                    <DonationListItem
                      key={d._id}
                      donation={d}
                      onDelete={handleDelete}
                      deleting={deletingId === d._id}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact donation item shown in the "My Donations" sidebar list
function DonationListItem({ donation, onDelete, deleting }) {
  const expired = new Date(donation.expiryTime) < new Date();

  return (
    <div className={`border rounded-xl p-3 space-y-1.5 ${
      donation.claimed ? 'border-primary-200 bg-primary-50' :
      expired ? 'border-neutral-200 bg-neutral-50 opacity-60' :
      'border-neutral-200 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm text-neutral-900 leading-snug">{donation.foodName}</p>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!donation.claimed && !expired && (
            <button
              onClick={() => onDelete(donation._id)}
              disabled={deleting}
              className="p-1 rounded hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <span>{donation.quantity}</span>
        <span>·</span>
        <span>{donation.location}</span>
      </div>

      {/* Status badge */}
      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
        donation.claimed ? 'bg-primary-100 text-primary-700' :
        expired ? 'bg-neutral-200 text-neutral-500' :
        'bg-amber-100 text-amber-700'
      }`}>
        {donation.claimed ? `Claimed by ${donation.claimedBy?.name || 'NGO'}` :
         expired ? 'Expired' : 'Available'}
      </span>
    </div>
  );
}
