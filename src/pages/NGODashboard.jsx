// NGODashboard — dashboard for NGO accounts
// Shows available food to claim, and a history of already-claimed donations
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import FoodCard from '../components/FoodCard.jsx';
import {
  LayoutDashboard, Package, CheckCircle, Clock,
  RefreshCw, AlertCircle, TrendingUp
} from 'lucide-react';

const TABS = [
  { id: 'available', label: 'Available Food', icon: <Package className="w-4 h-4" /> },
  { id: 'claimed', label: 'My Claims', icon: <CheckCircle className="w-4 h-4" /> },
];

export default function NGODashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('available');

  const [available, setAvailable] = useState([]);
  const [claimed, setClaimed] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(true);
  const [claimedLoading, setClaimedLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [claimMsg, setClaimMsg] = useState({ id: null, type: '', text: '' });

  // Fetch available donations on mount
  useEffect(() => {
    fetchAvailable();
    fetchClaimed();
  }, []);

  const fetchAvailable = async () => {
    setAvailableLoading(true);
    try {
      const { data } = await axios.get('/api/donations');
      setAvailable(data.donations);
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
      setClaimed(data.donations);
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
      setClaimMsg({ id: donationId, type: 'success', text: 'Donation claimed! Contact the provider for pickup.' });
      // Move from available to claimed
      setAvailable((prev) => prev.filter((d) => d._id !== donationId));
      setClaimed((prev) => [data.donation, ...prev]);
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

  // Computed stats
  const expiringSoon = available.filter((d) => {
    const hrs = (new Date(d.expiryTime) - new Date()) / (1000 * 60 * 60);
    return hrs > 0 && hrs <= 6;
  }).length;

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-5 h-5 text-primary-600" />
              <h1 className="font-display text-3xl font-bold text-neutral-900">NGO Dashboard</h1>
            </div>
            <p className="text-neutral-500">Welcome back, <strong className="text-neutral-700">{user?.name}</strong></p>
          </div>
          <button
            onClick={() => { fetchAvailable(); fetchClaimed(); }}
            className="btn-secondary flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Package className="w-5 h-5 text-primary-600" />}
            label="Available Now"
            value={availableLoading ? '—' : available.length}
            bg="bg-primary-50"
          />
          <StatCard
            icon={<Clock className="w-5 h-5 text-red-500" />}
            label="Expiring Soon"
            value={availableLoading ? '—' : expiringSoon}
            bg="bg-red-50"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5 text-green-600" />}
            label="Total Claimed"
            value={claimedLoading ? '—' : claimed.length}
            bg="bg-green-50"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-accent-600" />}
            label="This Month"
            value={claimedLoading ? '—' : claimed.filter((d) => {
              const claimedDate = new Date(d.claimedAt);
              const now = new Date();
              return claimedDate.getMonth() === now.getMonth() && claimedDate.getFullYear() === now.getFullYear();
            }).length}
            bg="bg-accent-50"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-100 rounded-xl p-1 w-fit mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'available' && !availableLoading && available.length > 0 && (
                <span className="bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {available.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'available' && (
          <AvailableTab
            donations={available}
            loading={availableLoading}
            onClaim={handleClaim}
            claimingId={claimingId}
            claimMsg={claimMsg}
          />
        )}

        {activeTab === 'claimed' && (
          <ClaimedTab donations={claimed} loading={claimedLoading} />
        )}
      </div>
    </div>
  );
}

// ─── Available tab ──────────────────────────────────────────────
function AvailableTab({ donations, loading, onClaim, claimingId, claimMsg }) {
  if (loading) return <LoadingGrid />;

  if (donations.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-neutral-700 mb-2">No donations available</h3>
        <p className="text-neutral-500">New donations will appear here as providers post them. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {donations.map((donation) => (
        <div key={donation._id}>
          {claimMsg.id === donation._id && claimMsg.text && (
            <div className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 mb-2 ${
              claimMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {claimMsg.text}
            </div>
          )}
          <FoodCard
            donation={donation}
            onClaim={onClaim}
            isClaiming={claimingId === donation._id}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Claimed history tab ─────────────────────────────────────────
function ClaimedTab({ donations, loading }) {
  if (loading) return <LoadingGrid />;

  if (donations.length === 0) {
    return (
      <div className="text-center py-16">
        <CheckCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-neutral-700 mb-2">No claims yet</h3>
        <p className="text-neutral-500">Donations you claim will appear here for your records.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {donations.map((donation) => (
        <FoodCard
          key={donation._id}
          donation={{ ...donation, claimed: true }}
          showClaimedBy={false}
        />
      ))}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-neutral-900">{value}</p>
        <p className="text-xs text-neutral-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="card animate-pulse space-y-3">
          <div className="h-5 bg-neutral-200 rounded w-3/4" />
          <div className="h-3 bg-neutral-100 rounded" />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, j) => <div key={j} className="h-10 bg-neutral-100 rounded" />)}
          </div>
          <div className="h-10 bg-neutral-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
