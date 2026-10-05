// FoodRequestsPage — NGO urgent food broadcasts & provider fulfillment hub
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import CountdownTimer from '../components/CountdownTimer.jsx';
import {
  Heart, PlusCircle, Search, MapPin,
  AlertCircle, Users, Utensils, X, Clock
} from 'lucide-react';

const CATEGORIES = [
  { value: 'any', label: 'All Categories' },
  { value: 'cooked', label: 'Cooked Food' },
  { value: 'raw', label: 'Raw / Grains / Veg' },
  { value: 'packaged', label: 'Packaged Food' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'bakery', label: 'Bakery Items' },
];

const DIETARY = [
  { value: 'any', label: 'All Dietary Types' },
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non-veg', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
];

export default function FoodRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [category, setCategory] = useState('any');
  const [dietaryType, setDietaryType] = useState('any');
  const [locationSearch, setLocationSearch] = useState('');

  // Modal for new request
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    servingsNeeded: '',
    location: '',
    neededBy: '',
    category: 'cooked',
    dietaryType: 'veg',
    urgency: 'high',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });

  // Fulfill tracking
  const [fulfillingId, setFulfillingId] = useState(null);
  const [fulfillMsg, setFulfillMsg] = useState({ id: null, type: '', text: '' });

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'any') params.category = category;
      if (dietaryType !== 'any') params.dietaryType = dietaryType;
      if (locationSearch) params.location = locationSearch;

      const { data } = await axios.get('/api/requests', { params });
      setRequests(data.requests || []);
    } catch (err) {
      setError('Failed to load food requests.');
    } finally {
      setLoading(false);
    }
  }, [category, dietaryType, locationSearch]);

  useEffect(() => {
    const timer = setTimeout(fetchRequests, 300);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg({ type: '', text: '' });

    try {
      await axios.post('/api/requests', newRequest);
      setFormMsg({ type: 'success', text: 'Food request posted! Providers in your area will be notified.' });
      setTimeout(() => {
        setShowModal(false);
        setNewRequest({
          title: '',
          servingsNeeded: '',
          location: '',
          neededBy: '',
          category: 'cooked',
          dietaryType: 'veg',
          urgency: 'high',
          notes: '',
        });
        fetchRequests();
      }, 1000);
    } catch (err) {
      setFormMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to post food request.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFulfill = async (requestId) => {
    if (!user) {
      setFulfillMsg({ id: requestId, type: 'info', text: 'Please sign in as a food provider to fulfill requests.' });
      return;
    }
    if (user.role !== 'provider') {
      setFulfillMsg({ id: requestId, type: 'info', text: 'Only registered food providers can fulfill requests.' });
      return;
    }

    setFulfillingId(requestId);
    setFulfillMsg({ id: null, type: '', text: '' });

    try {
      await axios.post(`/api/requests/${requestId}/fulfill`);
      setFulfillMsg({
        id: requestId,
        type: 'success',
        text: 'Thank you! You have accepted to fulfill this request. Please coordinate with the NGO.',
      });
      fetchRequests();
    } catch (err) {
      setFulfillMsg({
        id: requestId,
        type: 'error',
        text: err.response?.data?.message || 'Failed to fulfill request.',
      });
    } finally {
      setFulfillingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="w-6 h-6 text-rose-600" />
              <h1 className="font-display text-3xl font-extrabold text-neutral-900">
                Community Food Requests
              </h1>
            </div>
            <p className="text-neutral-500 text-sm">
              Urgent food requirements broadcasted by verified NGOs and community shelters
            </p>
          </div>

          {user?.role === 'ngo' ? (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 shadow-sm self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              Post Food Request
            </button>
          ) : !user ? (
            <a
              href="/login"
              className="btn-secondary text-sm py-2 px-4 self-start sm:self-auto"
            >
              NGO Sign in to Post Request
            </a>
          ) : null}
        </div>

        {/* Filter Bar */}
        <div className="card mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
              placeholder="Filter by city / area (e.g. Bangalore, Delhi)..."
              className="input-field pl-10"
            />
            {locationSearch && (
              <button
                onClick={() => setLocationSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="w-full md:w-52 relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48 relative">
            <select
              value={dietaryType}
              onChange={(e) => setDietaryType(e.target.value)}
              className="input-field bg-white"
            >
              {DIETARY.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List of Requests */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse space-y-3">
                <div className="h-5 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-100 rounded" />
                <div className="h-10 bg-neutral-100 rounded" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
            <Heart className="w-16 h-16 text-neutral-300 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-neutral-700">No open food requests right now</h3>
            <p className="text-neutral-500 text-sm mt-1 mb-5">
              Check back soon, or broadcast a request if you are an NGO in need of meals.
            </p>
            {user?.role === 'ngo' && (
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Post Food Request
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {requests.map((req) => {
              const ngo = req.requestedBy;
              const cleanPhone = (ngo?.phone || '').replace(/[^0-9]/g, '');
              const whatsappUrl = cleanPhone
                ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
                    `Hi ${ngo?.name}, I am a food provider on FoodBridge regarding your food request: "${req.title}".`
                  )}`
                : null;

              return (
                <div
                  key={req._id}
                  className={`card flex flex-col justify-between border transition-all ${
                    req.urgency === 'critical'
                      ? 'border-rose-300 bg-rose-50/20'
                      : req.urgency === 'high'
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-neutral-200'
                  }`}
                >
                  <div>
                    {/* Header tags */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          req.urgency === 'critical'
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : req.urgency === 'high'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {req.urgency} Urgency
                      </span>

                      <CountdownTimer expiryTime={req.neededBy} compact />
                    </div>

                    <h3 className="font-display font-bold text-lg text-neutral-900 leading-snug mb-2">
                      {req.title}
                    </h3>

                    {/* Details box */}
                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 flex items-center gap-1.5 font-medium">
                          <Users className="w-3.5 h-3.5 text-primary-600" /> Servings Needed:
                        </span>
                        <strong className="text-neutral-900 text-sm font-bold">
                          {req.servingsNeeded} meals
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> Delivery Area:
                        </span>
                        <span className="text-neutral-800 font-semibold truncate max-w-[150px]">
                          {req.location}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-neutral-500 flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Needed By:
                        </span>
                        <span className="text-neutral-800 font-semibold">
                          {new Date(req.neededBy).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-neutral-600 mb-4 bg-white p-2.5 rounded-lg border border-neutral-100 leading-relaxed">
                        {req.notes}
                      </p>
                    )}

                    {/* NGO Info */}
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
                      <span className="truncate">
                        Requested by: <strong>{ngo?.name || 'NGO Partner'}</strong>
                      </span>
                      <div className="flex items-center gap-1.5">
                        {ngo?.phone && (
                          <a
                            href={`tel:${ngo.phone}`}
                            className="text-primary-600 hover:underline font-semibold"
                          >
                            Call
                          </a>
                        )}
                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline font-semibold"
                          >
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action / Fulfill Button */}
                  <div className="pt-3 border-t border-neutral-100">
                    {fulfillMsg.id === req._id && fulfillMsg.text && (
                      <div
                        className={`text-xs p-2 rounded-lg mb-2 flex items-center gap-1.5 ${
                          fulfillMsg.type === 'success'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {fulfillMsg.text}
                      </div>
                    )}

                    {user?.role === 'provider' ? (
                      <button
                        onClick={() => handleFulfill(req._id)}
                        disabled={fulfillingId === req._id}
                        className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Utensils className="w-4 h-4" />
                        {fulfillingId === req._id ? 'Accepting...' : 'I Can Fulfill This Request'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFulfill(req._id)}
                        className="btn-secondary w-full text-xs py-2.5 flex items-center justify-center gap-1.5"
                      >
                        <Utensils className="w-4 h-4" />
                        Provider: Fulfill Request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post Food Request Modal (NGO Only) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-neutral-200">
            <div className="bg-gradient-to-r from-rose-600 to-primary-600 p-6 text-white relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-display font-bold text-2xl">Broadcast Urgent Food Need</h2>
              <p className="text-white/80 text-xs mt-1">
                Posting as <strong>{user?.name}</strong>
              </p>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto">
              {formMsg.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 ${
                    formMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {formMsg.text}
                </div>
              )}

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Request Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                    placeholder="e.g. Need 40 dinner meals for children shelter"
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Servings (Meals) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newRequest.servingsNeeded}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, servingsNeeded: e.target.value })
                      }
                      placeholder="e.g. 50"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Urgency Level
                    </label>
                    <select
                      value={newRequest.urgency}
                      onChange={(e) => setNewRequest({ ...newRequest, urgency: e.target.value })}
                      className="input-field bg-white"
                    >
                      <option value="critical">🚨 Critical (Under 3 hrs)</option>
                      <option value="high">⚡ High (Today)</option>
                      <option value="normal">🕒 Normal (Planned)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Delivery / Drop-off Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRequest.location}
                    onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                    placeholder="e.g. Hope Shelter, 12th Cross, Indiranagar"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Needed By (Date & Time) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newRequest.neededBy}
                    onChange={(e) => setNewRequest({ ...newRequest, neededBy: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Category
                    </label>
                    <select
                      value={newRequest.category}
                      onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                      className="input-field bg-white"
                    >
                      <option value="cooked">Cooked Food</option>
                      <option value="raw">Raw / Grains</option>
                      <option value="packaged">Packaged</option>
                      <option value="bakery">Bakery Items</option>
                      <option value="any">Any Suitable Food</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                      Dietary Preference
                    </label>
                    <select
                      value={newRequest.dietaryType}
                      onChange={(e) =>
                        setNewRequest({ ...newRequest, dietaryType: e.target.value })
                      }
                      className="input-field bg-white"
                    >
                      <option value="veg">Pure Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="any">Any / No restriction</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1">
                    Additional Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newRequest.notes}
                    onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                    placeholder="Special dietary requirements, gate entry instructions, etc."
                    className="input-field resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary text-sm py-2 px-6 disabled:opacity-50"
                  >
                    {submitting ? 'Broadcasting...' : 'Broadcast Food Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
