// ProviderDashboard — dedicated control hub for food providers (restaurants, hostels, canteens)
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import FoodCard from '../components/FoodCard.jsx';
import DonationDetailModal from '../components/DonationDetailModal.jsx';
import {
  PlusCircle, Package, CheckCircle, Clock,
  RefreshCw, KeyRound, AlertCircle, Sparkles, Building2
} from 'lucide-react';

const TABS = [
  { id: 'all', label: 'All Listings' },
  { id: 'active', label: 'Active & Available' },
  { id: 'claimed', label: 'Claimed (Pending Pickup)' },
  { id: 'completed', label: 'Completed History' },
];

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Quick OTP verification state
  const [otpCode, setOtpCode] = useState('');
  const [selectedDonationId, setSelectedDonationId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState({ type: '', text: '' });

  // Modal view state
  const [activeModalDonation, setActiveModalDonation] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [donationsRes, impactRes] = await Promise.all([
        axios.get('/api/donations/my'),
        axios.get('/api/auth/impact'),
      ]);
      setDonations(donationsRes.data.donations || []);
      setImpact(impactRes.data || null);
    } catch (err) {
      console.error('Provider dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickOtpVerify = async (e) => {
    e.preventDefault();
    if (!selectedDonationId) {
      setOtpMessage({ type: 'error', text: 'Please select which claimed donation is being picked up.' });
      return;
    }
    if (!otpCode || otpCode.trim().length !== 4) {
      setOtpMessage({ type: 'error', text: 'Please enter the 4-digit code provided by the NGO driver.' });
      return;
    }

    setVerifying(true);
    setOtpMessage({ type: '', text: '' });

    try {
      const { data } = await axios.post(`/api/donations/${selectedDonationId}/verify-pickup`, {
        pickupCode: otpCode.trim(),
      });
      setOtpMessage({
        type: 'success',
        text: `Handover verified! "${data.donation.foodName}" marked as Completed.`,
      });
      setOtpCode('');
      setSelectedDonationId('');
      fetchData();
    } catch (err) {
      setOtpMessage({
        type: 'error',
        text: err.response?.data?.message || 'Verification failed. Incorrect OTP.',
      });
    } finally {
      setVerifying(false);
    }
  };

  // Filtered lists
  const now = new Date();
  const claimedList = donations.filter((d) => d.status === 'claimed' || (d.claimed && d.status !== 'completed'));
  const activeList = donations.filter((d) => !d.claimed && new Date(d.expiryTime) > now);
  const completedList = donations.filter((d) => d.status === 'completed');

  const displayedList =
    activeTab === 'active'
      ? activeList
      : activeTab === 'claimed'
      ? claimedList
      : activeTab === 'completed'
      ? completedList
      : donations;

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-6 h-6 text-primary-600" />
              <h1 className="font-display text-3xl font-extrabold text-neutral-900">
                Provider Dashboard
              </h1>
            </div>
            <p className="text-neutral-500 text-sm">
              Manage surplus food donations for <strong className="text-neutral-800">{user?.name}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4"
              title="Refresh listings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/donate"
              className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Post New Food
            </Link>
          </div>
        </div>

        {/* Impact Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={<Package className="w-5 h-5 text-primary-600" />}
            label="Total Meals Rescued"
            value={impact ? `${impact.totalMealsRescued}` : '—'}
            subtitle="Portions fed"
            bg="bg-primary-50 border-primary-100"
          />
          <MetricCard
            icon={<Sparkles className="w-5 h-5 text-emerald-600" />}
            label="CO2 Prevented"
            value={impact ? `${impact.co2SavedKg} kg` : '—'}
            subtitle="Greenhouse emissions saved"
            bg="bg-emerald-50 border-emerald-100"
          />
          <MetricCard
            icon={<Clock className="w-5 h-5 text-amber-600" />}
            label="Active Listings"
            value={loading ? '—' : activeList.length}
            subtitle="Awaiting claims"
            bg="bg-amber-50 border-amber-100"
          />
          <MetricCard
            icon={<CheckCircle className="w-5 h-5 text-blue-600" />}
            label="Claimed / Handover"
            value={loading ? '—' : claimedList.length}
            subtitle="Ready for pickup"
            bg="bg-blue-50 border-blue-100"
          />
        </div>

        {/* Quick OTP Verification Box (When there are claimed items) */}
        {claimedList.length > 0 && (
          <div className="card mb-8 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-amber-50/90 border-2 border-amber-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-900 font-display font-bold text-base">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                  Fast Handover Verification
                </div>
                <p className="text-xs text-amber-800 leading-relaxed max-w-xl">
                  NGO volunteer standing in front of you? Ask for their 4-digit pickup code to confirm
                  handover and complete the donation.
                </p>
              </div>

              <form onSubmit={handleQuickOtpVerify} className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedDonationId}
                  onChange={(e) => setSelectedDonationId(e.target.value)}
                  className="input-field text-xs py-2 w-48 bg-white"
                  required
                >
                  <option value="">Select Food Item...</option>
                  {claimedList.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.foodName} ({d.claimedBy?.name || 'NGO'})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="4-digit OTP"
                  className="input-field text-center font-mono font-bold tracking-widest text-sm py-2 w-28 bg-white"
                  required
                />

                <button
                  type="submit"
                  disabled={verifying}
                  className="btn-primary text-xs py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50"
                >
                  {verifying ? 'Verifying...' : 'Verify Pickup'}
                </button>
              </form>
            </div>

            {otpMessage.text && (
              <div
                className={`mt-3 flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold ${
                  otpMessage.type === 'success'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {otpMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{otpMessage.text}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab Filters */}
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
              {tab.id === 'claimed' && claimedList.length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {claimedList.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid of Listings */}
        {loading ? (
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
        ) : displayedList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-200">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold text-neutral-700">No donations in this view</h3>
            <p className="text-neutral-500 text-sm mt-1 mb-5">
              {activeTab === 'all'
                ? "You haven't posted any food donations yet."
                : `No items currently matching the "${activeTab}" filter.`}
            </p>
            <Link to="/donate" className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Post Food Donation
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedList.map((donation) => (
              <FoodCard
                key={donation._id}
                donation={donation}
                showClaimedBy={true}
                onRefresh={fetchData}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {activeModalDonation && (
        <DonationDetailModal
          donation={activeModalDonation}
          onClose={() => setActiveModalDonation(null)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, subtitle, bg }) {
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
