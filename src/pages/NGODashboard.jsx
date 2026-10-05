// NGODashboard — comprehensive dashboard for NGO partners and community shelters
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import FoodCard from '../components/FoodCard.jsx';
import CountdownTimer from '../components/CountdownTimer.jsx';
import {
  Package, CheckCircle, RefreshCw, AlertCircle, KeyRound,
  MapPin, ExternalLink, Phone, MessageSquare, Sparkles,
  HeartHandshake, Search, Utensils
} from 'lucide-react';

const TABS = [
  { id: 'active_pickups', label: 'Active Pickups (OTPs)' },
  { id: 'available', label: 'Available Food' },
  { id: 'claimed_history', label: 'My Claims History' },
];

export default function NGODashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('active_pickups');

  const [available, setAvailable] = useState([]);
  const [claimed, setClaimed] = useState([]);
  const [impact, setImpact] = useState(null);

  const [availableLoading, setAvailableLoading] = useState(true);
  const [claimedLoading, setClaimedLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [claimMsg, setClaimMsg] = useState({ id: null, type: '', text: '' });

  // Filter for available food tab
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDietary, setFilterDietary] = useState('');

  const fetchAll = async () => {
    fetchAvailable();
    fetchClaimed();
    fetchImpact();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchImpact = async () => {
    try {
      const { data } = await axios.get('/api/auth/impact');
      setImpact(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailable = async () => {
    setAvailableLoading(true);
    try {
      const params = {};
      if (filterCategory) params.category = filterCategory;
      if (filterDietary) params.dietaryType = filterDietary;
      if (filterLocation) params.location = filterLocation;

      const { data } = await axios.get('/api/donations', { params });
      setAvailable(data.donations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setAvailableLoading(false);
    }
  };

  const fetchClaimed = async () => {
    setClaimedLoading(true);
    try {
      const { data } = await axios.get('/api/donations/claimed');
      setClaimed(data.donations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setClaimedLoading(false);
    }
  };

  const handleClaim = async (donationId) => {
    setClaimingId(donationId);
    setClaimMsg({ id: null, type: '', text: '' });
    try {
      const { data } = await axios.post(`/api/donations/${donationId}/claim`);
      setClaimMsg({
        id: donationId,
        type: 'success',
        text: `Donation claimed! Verification OTP: ${data.pickupCode}`,
      });
      // Move to claimed list
      setAvailable((prev) => prev.filter((d) => d._id !== donationId));
      setClaimed((prev) => [data.donation, ...prev]);
      setActiveTab('active_pickups');
      fetchImpact();
    } catch (err) {
      setClaimMsg({
        id: donationId,
        type: 'error',
        text: err.response?.data?.message || 'Claim failed. Please try again.',
      });
    } finally {
      setClaimingId(null);
    }
  };

  const handleCancelClaim = async (donationId) => {
    if (!window.confirm('Release this claim so other NGOs can pick it up?')) return;
    try {
      await axios.post(`/api/donations/${donationId}/cancel`, {
        reason: 'NGO volunteer unable to pickup',
      });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel claim.');
    }
  };

  // Active pickups (claimed but not yet verified as completed)
  const activePickups = claimed.filter((d) => d.status !== 'completed' && d.status !== 'cancelled');
  const completedHistory = claimed.filter((d) => d.status === 'completed');

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HeartHandshake className="w-6 h-6 text-primary-600" />
              <h1 className="font-display text-3xl font-extrabold text-neutral-900">
                NGO Relief Dashboard
              </h1>
            </div>
            <p className="text-neutral-500 text-sm">
              Welcome back, <strong className="text-neutral-800">{user?.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4"
            >
              <RefreshCw
                className={`w-4 h-4 ${availableLoading || claimedLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
            <Link to="/requests" className="btn-primary text-sm py-2.5 px-4 shadow-sm">
              + Post Food Request
            </Link>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Utensils className="w-5 h-5 text-primary-600" />}
            label="Meals Distributed"
            value={impact ? `${impact.totalMealsDistributed}` : '—'}
            subtitle="Community portions"
            bg="bg-primary-50 border-primary-100"
          />
          <StatCard
            icon={<Sparkles className="w-5 h-5 text-emerald-600" />}
            label="CO2 Avoided"
            value={impact ? `${impact.co2SavedKg} kg` : '—'}
            subtitle="Emissions prevented"
            bg="bg-emerald-50 border-emerald-100"
          />
          <StatCard
            icon={<KeyRound className="w-5 h-5 text-amber-600" />}
            label="Active Pickups"
            value={claimedLoading ? '—' : activePickups.length}
            subtitle="In progress"
            bg="bg-amber-50 border-amber-100"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
            label="Completed Rescues"
            value={claimedLoading ? '—' : completedHistory.length}
            subtitle="Verified handovers"
            bg="bg-blue-50 border-blue-100"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1.5 bg-neutral-100 rounded-xl p-1 w-fit mb-6 overflow-x-auto max-w-full">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
              {tab.id === 'active_pickups' && activePickups.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activePickups.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── TAB 1: ACTIVE PICKUPS WITH OTPs ─── */}
        {activeTab === 'active_pickups' && (
          <div>
            {claimedLoading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="card animate-pulse h-40 bg-neutral-200" />
                ))}
              </div>
            ) : activePickups.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
                <KeyRound className="w-16 h-16 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold text-neutral-800">
                  No active pickups pending
                </h3>
                <p className="text-neutral-500 text-sm mt-1 mb-5">
                  Browse available food listings and claim donations to dispatch pickup volunteers.
                </p>
                <button onClick={() => setActiveTab('available')} className="btn-primary text-sm py-2 px-5">
                  Browse Available Food
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {activePickups.map((d) => {
                  const provider = d.donatedBy;
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    d.location
                  )}`;
                  const cleanPhone = (provider?.phone || '').replace(/[^0-9]/g, '');
                  const whatsappUrl = cleanPhone
                    ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
                        `Hi ${provider?.name}, this is ${user?.name}. We are coordinating pickup for "${d.foodName}".`
                      )}`
                    : null;

                  return (
                    <div
                      key={d._id}
                      className="card border-2 border-primary-300 bg-gradient-to-b from-primary-50/40 to-white flex flex-col justify-between shadow-sm"
                    >
                      <div>
                        {/* Header banner */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <span className="bg-primary-100 text-primary-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {d.category}
                            </span>
                            <h3 className="font-display font-bold text-xl text-neutral-900 mt-1">
                              {d.foodName}
                            </h3>
                          </div>
                          <CountdownTimer expiryTime={d.expiryTime} compact />
                        </div>

                        {/* OTP Highlight Banner */}
                        <div className="bg-white border-2 border-primary-500 rounded-2xl p-4 my-3 flex items-center justify-between shadow-sm">
                          <div>
                            <p className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                              Handover Verification Code
                            </p>
                            <p className="text-[11px] text-neutral-500">
                              Show this code to donor upon arrival
                            </p>
                          </div>
                          <div className="bg-primary-700 text-white font-mono font-black text-2xl tracking-widest px-4 py-1.5 rounded-xl shadow-xs">
                            {d.pickupCode || '1234'}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500 font-medium">Quantity:</span>
                            <strong className="text-neutral-900">{d.quantity} (~{d.servings || 15} meals)</strong>
                          </div>

                          <div className="flex items-start justify-between gap-2">
                            <span className="text-neutral-500 font-medium flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" /> Address:
                            </span>
                            <span className="text-neutral-900 font-semibold text-right flex-1 truncate max-w-[200px]">
                              {d.location}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-neutral-500 font-medium">Donor:</span>
                            <span className="text-neutral-900 font-bold">{provider?.name || 'Provider'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Links */}
                      <div className="pt-3 border-t border-neutral-100 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-xs py-2 px-2 flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Maps
                          </a>

                          {provider?.phone && (
                            <a
                              href={`tel:${provider.phone}`}
                              className="btn-secondary text-xs py-2 px-2 flex items-center justify-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5 text-primary-600" />
                              Call
                            </a>
                          )}

                          {whatsappUrl && (
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              WhatsApp
                            </a>
                          )}
                        </div>

                        <div className="text-center pt-1">
                          <button
                            onClick={() => handleCancelClaim(d._id)}
                            className="text-[11px] text-red-500 hover:text-red-700 hover:underline"
                          >
                            Unable to pickup? Cancel claim
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: AVAILABLE FOOD TO CLAIM ─── */}
        {activeTab === 'available' && (
          <div>
            {/* Quick Filters */}
            <div className="card mb-6 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  placeholder="Filter by city/area..."
                  className="input-field pl-10"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-field sm:w-48 bg-white"
              >
                <option value="">All Categories</option>
                <option value="cooked">Cooked Food</option>
                <option value="raw">Raw / Veg</option>
                <option value="packaged">Packaged</option>
                <option value="bakery">Bakery</option>
              </select>

              <select
                value={filterDietary}
                onChange={(e) => setFilterDietary(e.target.value)}
                className="input-field sm:w-44 bg-white"
              >
                <option value="">All Dietary</option>
                <option value="veg">Vegetarian</option>
                <option value="non-veg">Non-Veg</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>

            {claimMsg.text && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold mb-5 flex items-center gap-2 ${
                  claimMsg.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {claimMsg.text}
              </div>
            )}

            {availableLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card animate-pulse space-y-3">
                    <div className="h-5 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-100 rounded" />
                    <div className="grid grid-cols-2 gap-2">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-10 bg-neutral-100 rounded" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : available.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
                <Package className="w-16 h-16 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold text-neutral-800">
                  No donations matching filters
                </h3>
                <p className="text-neutral-500 text-sm mt-1">
                  Providers post food throughout the day. Check back in a few minutes!
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {available.map((d) => (
                  <FoodCard
                    key={d._id}
                    donation={d}
                    onClaim={handleClaim}
                    isClaiming={claimingId === d._id}
                    onRefresh={fetchAll}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 3: CLAIMS & RESCUE HISTORY ─── */}
        {activeTab === 'claimed_history' && (
          <div>
            {claimedLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card animate-pulse h-48 bg-neutral-100" />
                ))}
              </div>
            ) : claimed.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
                <CheckCircle className="w-16 h-16 text-neutral-300 mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold text-neutral-800">No past claims yet</h3>
                <p className="text-neutral-500 text-sm mt-1">
                  Your claimed donations and rescue history will appear here.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {claimed.map((d) => (
                  <FoodCard
                    key={d._id}
                    donation={d}
                    showClaimedBy={true}
                    onRefresh={fetchAll}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, bg }) {
  return (
    <div className={`rounded-2xl p-4 border flex flex-col justify-between ${bg}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-display font-extrabold text-neutral-900">{value}</p>
        <p className="text-[11px] text-neutral-500 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
