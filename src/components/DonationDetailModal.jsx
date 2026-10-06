// DonationDetailModal — comprehensive modal with food safety info, navigation, and OTP verification
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import CountdownTimer from './CountdownTimer.jsx';
import {
  X, MapPin, Phone, MessageSquare, ShieldCheck,
  CheckCircle, AlertCircle, ExternalLink, KeyRound
} from 'lucide-react';

const dietaryLabels = {
  veg: { label: 'Vegetarian', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🌱' },
  'non-veg': { label: 'Non-Veg', color: 'bg-red-100 text-red-800 border-red-200', icon: '🍗' },
  vegan: { label: 'Vegan', color: 'bg-green-100 text-green-800 border-green-200', icon: '🌿' },
  egg: { label: 'Egg', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🥚' },
  other: { label: 'General Food', color: 'bg-neutral-100 text-neutral-800 border-neutral-200', icon: '🍽️' },
};

const storageLabels = {
  room_temp: { label: 'Room Temperature', icon: '📦' },
  refrigerated: { label: 'Refrigerated (< 4°C)', icon: '❄️' },
  hot: { label: 'Hot / Freshly Cooked (> 60°C)', icon: '🔥' },
  frozen: { label: 'Frozen (< -18°C)', icon: '🧊' },
};

export default function DonationDetailModal({
  donation,
  onClose,
  onClaim,
  onRefresh,
  isClaiming,
}) {
  const { user } = useAuth();
  const [verifyOtp, setVerifyOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [cancelling, setCancelling] = useState(false);

  if (!donation) return null;

  const provider = donation.donatedBy;
  const claimer = donation.claimedBy;
  const isProviderOwner = user && provider && (provider._id === user._id || provider === user._id);
  const isClaimedByMe = user && claimer && (claimer._id === user._id || claimer === user._id);
  const isExpired = new Date(donation.expiryTime) < new Date();

  // Maps URL
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    donation.location
  )}`;

  // WhatsApp link helper
  const cleanPhone = (provider?.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(
        `Hi ${provider?.name}, I am reaching out regarding your food donation "${donation.foodName}" on FoodBridge.`
      )}`
    : null;

  // Handle Handover OTP verification
  const handleVerifyPickup = async (e) => {
    e.preventDefault();
    if (!verifyOtp || verifyOtp.trim().length !== 4) {
      setActionError('Please enter the 4-digit verification OTP provided by the NGO.');
      return;
    }

    setVerifying(true);
    setActionError('');
    setActionSuccess('');

    try {
      await axios.post(`/api/donations/${donation._id}/verify-pickup`, {
        pickupCode: verifyOtp.trim(),
      });
      setActionSuccess('Pickup verified successfully! Status marked as Completed.');
      if (onRefresh) onRefresh();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Verification failed. Incorrect code.');
    } finally {
      setVerifying(false);
    }
  };

  // Handle Cancel
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this?')) return;
    setCancelling(true);
    setActionError('');
    try {
      await axios.post(`/api/donations/${donation._id}/cancel`, {
        reason: isProviderOwner ? 'Provider cancelled' : 'NGO cancelled claim',
      });
      setActionSuccess('Donation status updated.');
      if (onRefresh) onRefresh();
      setTimeout(onClose, 1200);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setCancelling(false);
    }
  };

  const diet = dietaryLabels[donation.dietaryType] || dietaryLabels.other;
  const storage = storageLabels[donation.storageRequirement] || storageLabels.room_temp;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-8 border border-neutral-200">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-emerald-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              {donation.category}
            </span>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
              {diet.icon} {diet.label}
            </span>
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
              {storage.icon} {storage.label}
            </span>
          </div>

          <h2 className="font-display font-bold text-2xl md:text-3xl text-white">
            {donation.foodName}
          </h2>
          <p className="text-white/80 text-sm mt-1">
            Offered by <strong className="text-white">{provider?.name || 'Anonymous Provider'}</strong>
          </p>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status and Action feedback alerts */}
          {actionSuccess && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Expiry countdown header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Pickup Deadline</p>
              <p className="text-sm font-bold text-neutral-800">
                {new Date(donation.expiryTime).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <CountdownTimer expiryTime={donation.expiryTime} />
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-primary-50/60 border border-primary-100 rounded-2xl p-3.5">
              <p className="text-xs text-primary-700 font-medium">Quantity Available</p>
              <p className="text-lg font-display font-bold text-primary-900 mt-0.5">
                {donation.quantity}
              </p>
            </div>
            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3.5">
              <p className="text-xs text-amber-700 font-medium">Estimated Servings</p>
              <p className="text-lg font-display font-bold text-amber-900 mt-0.5">
                ~{donation.servings || 15} meals
              </p>
            </div>
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 col-span-2 sm:col-span-1">
              <p className="text-xs text-emerald-700 font-medium">Status</p>
              <p className="text-lg font-display font-bold capitalize text-emerald-900 mt-0.5">
                {donation.status || (donation.claimed ? 'Claimed' : 'Available')}
              </p>
            </div>
          </div>

          {/* Location & Directions */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Pickup Address
                  </h4>
                  <p className="text-sm font-semibold text-neutral-900 mt-0.5">
                    {donation.location}
                  </p>
                </div>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1 flex-shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Google Maps
              </a>
            </div>
          </div>

          {/* Additional Notes & Allergen Info */}
          {donation.notes && (
            <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                Donor Instructions & Notes
              </h4>
              <p className="text-sm text-neutral-700 leading-relaxed">{donation.notes}</p>
            </div>
          )}

          {/* Food Safety & Hygiene Checklist */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Food Safety & Quality Standard
            </div>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-emerald-900 font-medium">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                Freshly prepared / unexpired packaging
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                Hygienically covered & contained
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                Stored under suitable temperature
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                Sensory check passed (smell & look)
              </li>
            </ul>
          </div>

          {/* Direct Contact Options */}
          <div className="border border-neutral-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50">
            <div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">
                Provider Contact
              </p>
              <p className="text-sm font-bold text-neutral-900">
                {provider?.name || 'Contact on pickup'}
              </p>
              {provider?.phone && (
                <p className="text-xs text-neutral-600 mt-0.5">{provider.phone}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {provider?.phone && (
                <a
                  href={`tel:${provider.phone}`}
                  className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* ─── Pickup OTP Verification Section (For Provider Handover) ─── */}
          {isProviderOwner && donation.status === 'claimed' && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-amber-600" />
                Verify NGO Handover (Enter NGO's 4-digit OTP)
              </div>
              <p className="text-xs text-amber-800">
                When the NGO volunteer arrives, ask for their 4-digit pickup code and verify here to mark the donation as completed:
              </p>
              <form onSubmit={handleVerifyPickup} className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={verifyOtp}
                  onChange={(e) => setVerifyOtp(e.target.value)}
                  placeholder="e.g. 4821"
                  className="input-field text-center font-mono font-bold tracking-widest text-lg py-2 w-36 bg-white"
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="btn-primary text-sm px-5 py-2 disabled:opacity-50"
                >
                  {verifying ? 'Verifying...' : 'Verify Pickup'}
                </button>
              </form>
            </div>
          )}

          {/* ─── Pickup OTP Display for Claimed NGO ─── */}
          {(isClaimedByMe || (user?.role === 'ngo' && donation.claimedBy?._id === user._id)) &&
            donation.status === 'claimed' && (
              <div className="bg-primary-50 border-2 border-primary-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                    Your Pickup Verification OTP
                  </p>
                  <p className="text-xs text-primary-700 mt-0.5">
                    Show this 4-digit code to the provider upon picking up the food:
                  </p>
                </div>
                <div className="bg-white border-2 border-primary-500 rounded-xl px-4 py-2 text-center shadow-sm">
                  <span className="font-mono text-2xl font-black text-primary-700 tracking-widest">
                    {donation.pickupCode || 'VERIFY'}
                  </span>
                </div>
              </div>
            )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
          <div>
            {(isProviderOwner || isClaimedByMe) &&
              donation.status !== 'completed' &&
              donation.status !== 'cancelled' && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline"
                >
                  {isProviderOwner ? 'Cancel Donation Listing' : 'Release / Cancel Claim'}
                </button>
              )}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">
              Close
            </button>

            {/* Direct claim button inside modal if available and user is NGO */}
            {!donation.claimed && !isExpired && user?.role === 'ngo' && onClaim && (
              <button
                onClick={() => onClaim(donation._id)}
                disabled={isClaiming}
                className="btn-primary text-sm py-2 px-6 shadow-md"
              >
                {isClaiming ? 'Claiming...' : 'Claim This Donation'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
