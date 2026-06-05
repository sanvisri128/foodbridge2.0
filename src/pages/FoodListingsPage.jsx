// FoodListingsPage — browse and claim available donations (open to all, claim requires NGO login)
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import FoodCard from '../components/FoodCard.jsx';
import {
  Search, SlidersHorizontal, RefreshCw, Package,
  AlertCircle, X
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'cooked', label: 'Cooked Food' },
  { value: 'raw', label: 'Raw / Uncooked' },
  { value: 'packaged', label: 'Packaged' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'other', label: 'Other' },
];

export default function FoodListingsPage() {
  const { user } = useAuth();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Track which donation is being claimed
  const [claimingId, setClaimingId] = useState(null);
  const [claimMessage, setClaimMessage] = useState({ id: null, type: '', text: '' });

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchLocation) params.location = searchLocation;

      const { data } = await axios.get('/api/donations', { params });
      setDonations(data.donations);
    } catch (err) {
      setError('Failed to load donations. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchLocation]);

  // Fetch on mount and whenever filters change (debounced on location)
  useEffect(() => {
    const timer = setTimeout(fetchDonations, 300);
    return () => clearTimeout(timer);
  }, [fetchDonations]);

  const handleClaim = async (donationId) => {
    if (!user) {
      // Prompt to log in
      setClaimMessage({ id: donationId, type: 'info', text: 'Please log in as an NGO to claim donations.' });
      return;
    }
    if (user.role !== 'ngo') {
      setClaimMessage({ id: donationId, type: 'info', text: 'Only NGO accounts can claim donations.' });
      return;
    }

    setClaimingId(donationId);
    setClaimMessage({ id: null, type: '', text: '' });

    try {
      await axios.post(`/api/donations/${donationId}/claim`);
      setClaimMessage({ id: donationId, type: 'success', text: 'Claimed! Contact the provider for pickup details.' });
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

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-neutral-900">Available Food</h1>
            <p className="text-neutral-500 mt-1">
              {loading ? 'Loading...' : `${donations.length} donation${donations.length !== 1 ? 's' : ''} available right now`}
            </p>
          </div>
          <button
            onClick={fetchDonations}
            className="btn-secondary flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="card mb-6 flex flex-col sm:flex-row gap-4">
          {/* Location search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Filter by location..."
              className="input-field pl-10 pr-8"
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

          {/* Category filter */}
          <div className="sm:w-52 relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field pl-10 appearance-none bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* NGO login prompt banner */}
        {!user && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              To claim a donation,{' '}
              <Link to="/login" className="font-semibold underline hover:text-amber-900">sign in</Link>{' '}
              or{' '}
              <Link to="/register" className="font-semibold underline hover:text-amber-900">register</Link>{' '}
              as an NGO.
            </span>
          </div>
        )}

        {/* Global claim message (for non-NGO users) */}
        {claimMessage.id === null && claimMessage.text && (
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm mb-6 border ${
            claimMessage.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
            claimMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
            'bg-blue-50 border-blue-200 text-blue-700'
          }`}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {claimMessage.text}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse space-y-3">
                <div className="h-5 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-100 rounded w-full" />
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, j) => <div key={j} className="h-10 bg-neutral-100 rounded" />)}
                </div>
                <div className="h-10 bg-neutral-200 rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && donations.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="font-display text-xl font-bold text-neutral-700 mb-2">No donations available</h3>
            <p className="text-neutral-500 mb-6">
              {searchLocation || selectedCategory
                ? 'Try adjusting your filters to see more results.'
                : 'Check back soon — providers post donations throughout the day.'}
            </p>
            {(searchLocation || selectedCategory) && (
              <button
                onClick={() => { setSearchLocation(''); setSelectedCategory(''); }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Donations grid */}
        {!loading && donations.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {donations.map((donation) => (
              <div key={donation._id}>
                {/* Per-card claim feedback */}
                {claimMessage.id === donation._id && claimMessage.text && (
                  <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 mb-2 ${
                    claimMessage.type === 'success' ? 'bg-green-100 text-green-700' :
                    claimMessage.type === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {claimMessage.text}
                  </div>
                )}
                <FoodCard
                  donation={donation}
                  onClaim={user?.role === 'ngo' ? handleClaim : handleClaim}
                  isClaiming={claimingId === donation._id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
