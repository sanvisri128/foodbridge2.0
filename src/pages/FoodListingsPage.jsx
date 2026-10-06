// FoodListingsPage — public marketplace to browse, filter, and claim available surplus food
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import FoodCard from '../components/FoodCard.jsx';
import {
  Search, RefreshCw, Package, AlertCircle, X, Utensils
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'cooked', label: '🍛 Cooked Food' },
  { value: 'raw', label: '🥦 Raw / Veg / Grains' },
  { value: 'packaged', label: '📦 Packaged Items' },
  { value: 'beverages', label: '🥤 Beverages' },
  { value: 'bakery', label: '🍞 Bakery' },
  { value: 'other', label: '🍽️ Other' },
];

const DIETARY = [
  { value: '', label: 'All Dietary' },
  { value: 'veg', label: '🌱 Vegetarian' },
  { value: 'non-veg', label: '🍗 Non-Vegetarian' },
  { value: 'vegan', label: '🌿 Vegan' },
  { value: 'egg', label: '🥚 Egg' },
];

const URGENCY = [
  { value: '', label: 'All Timings' },
  { value: '2', label: '🚨 Expiring in < 2 hrs' },
  { value: '6', label: '⚡ Expiring in < 6 hrs' },
  { value: '24', label: '🕒 Expiring Today' },
];

export default function FoodListingsPage() {
  const { user } = useAuth();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('');
  const [maxHours, setMaxHours] = useState('');

  // Track which donation is being claimed
  const [claimingId, setClaimingId] = useState(null);
  const [claimMessage, setClaimMessage] = useState({ id: null, type: '', text: '' });

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedDietary) params.dietaryType = selectedDietary;
      if (maxHours) params.maxHours = maxHours;
      if (searchLocation) params.location = searchLocation;

      const { data } = await axios.get('/api/donations', { params });
      setDonations(data.donations || []);
    } catch {
      setError('Failed to load donations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedDietary, maxHours, searchLocation]);

  useEffect(() => {
    const timer = setTimeout(fetchDonations, 300);
    return () => clearTimeout(timer);
  }, [fetchDonations]);

  const handleClaim = async (donationId) => {
    if (!user) {
      setClaimMessage({
        id: donationId,
        type: 'info',
        text: 'Please log in or register as an NGO to claim donations.',
      });
      return;
    }
    if (user.role !== 'ngo') {
      setClaimMessage({
        id: donationId,
        type: 'info',
        text: 'Only registered NGO accounts can claim donations.',
      });
      return;
    }

    setClaimingId(donationId);
    setClaimMessage({ id: null, type: '', text: '' });

    try {
      const { data } = await axios.post(`/api/donations/${donationId}/claim`);
      setClaimMessage({
        id: donationId,
        type: 'success',
        text: `Donation claimed! Verification OTP: ${data.pickupCode}. Please check your Dashboard.`,
      });
      // Remove from available list
      setDonations((prev) => prev.filter((d) => d._id !== donationId));
    } catch (err) {
      setClaimMessage({
        id: donationId,
        type: 'error',
        text: err.response?.data?.message || 'Claim failed. Please try again.',
      });
    } finally {
      setClaimingId(null);
    }
  };

  const clearFilters = () => {
    setSearchLocation('');
    setSelectedCategory('');
    setSelectedDietary('');
    setMaxHours('');
  };

  const hasActiveFilters = searchLocation || selectedCategory || selectedDietary || maxHours;

  // Calculate live total meals
  const totalMealsAvailable = donations.reduce(
    (acc, curr) => acc + (curr.servings || 10),
    0
  );

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-neutral-900">
              Available Food Listings
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Real-time surplus food rescued from restaurants, hostels, and canteens
            </p>
          </div>
          <button
            onClick={fetchDonations}
            className="btn-secondary flex items-center gap-2 self-start sm:self-auto text-sm py-2 px-4"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Feed
          </button>
        </div>

        {/* Live Meal Ticker Banner */}
        <div className="bg-gradient-to-r from-primary-700 via-emerald-600 to-primary-800 rounded-2xl p-4 text-white flex flex-wrap items-center justify-between gap-4 mb-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-white/80 font-bold uppercase tracking-wider">
                Live Food Network
              </p>
              <p className="text-xl font-display font-extrabold">
                {loading ? '...' : donations.length} Active Donations
                <span className="text-white/80 text-sm font-normal ml-2">
                  (~{totalMealsAvailable} meal portions ready for rescue)
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/requests"
              className="bg-white text-primary-800 hover:bg-primary-50 text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              Need Specific Food? Post Request →
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="card mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Location search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Search area (e.g. Bangalore)..."
              className="input-field pl-10 pr-8 text-sm"
            />
            {searchLocation && (
              <button
                onClick={() => setSearchLocation('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field bg-white text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Dietary */}
          <select
            value={selectedDietary}
            onChange={(e) => setSelectedDietary(e.target.value)}
            className="input-field bg-white text-sm"
          >
            {DIETARY.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          {/* Urgency */}
          <select
            value={maxHours}
            onChange={(e) => setMaxHours(e.target.value)}
            className="input-field bg-white text-sm"
          >
            {URGENCY.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filter Clear Helper */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-6 bg-white px-4 py-2.5 rounded-xl border border-neutral-200">
            <span>Filtered results active</span>
            <button
              onClick={clearFilters}
              className="text-primary-700 font-bold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )}

        {/* NGO Login Prompt */}
        {!user && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl px-4 py-3 text-xs sm:text-sm mb-6 shadow-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <span>
              Are you an NGO, shelter, or orphanage?{' '}
              <Link to="/login" className="font-bold underline hover:text-amber-950">
                Log In
              </Link>{' '}
              or{' '}
              <Link to="/register" className="font-bold underline hover:text-amber-950">
                Register Free
              </Link>{' '}
              to claim any of these donations immediately.
            </span>
          </div>
        )}

        {/* Global Feedback Message */}
        {claimMessage.id === null && claimMessage.text && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold mb-6 flex items-center gap-2 ${
              claimMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {claimMessage.text}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-sm mb-6">
            <AlertCircle className="w-5 h-5 text-red-600" />
            {error}
          </div>
        )}

        {/* Skeleton */}
        {loading && (
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
                <div className="h-10 bg-neutral-200 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && donations.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 shadow-xs">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-neutral-800 mb-1">
              No matching donations found
            </h3>
            <p className="text-neutral-500 text-sm max-w-md mx-auto mb-6">
              {hasActiveFilters
                ? 'Try clearing or loosening your filters to see more available food.'
                : 'All donations for today have been claimed or none have been posted yet. Check back soon!'}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="btn-secondary text-sm py-2 px-5">
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Donations Grid */}
        {!loading && donations.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {donations.map((donation) => (
              <div key={donation._id}>
                {claimMessage.id === donation._id && claimMessage.text && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-semibold mb-2 flex items-center gap-1.5 ${
                      claimMessage.type === 'success'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    {claimMessage.text}
                  </div>
                )}
                <FoodCard
                  donation={donation}
                  onClaim={handleClaim}
                  isClaiming={claimingId === donation._id}
                  onRefresh={fetchDonations}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
