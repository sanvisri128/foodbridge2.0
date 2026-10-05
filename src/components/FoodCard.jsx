// FoodCard — modern card component with dietary tags, countdown timer, and quick details modal
import { useState } from 'react';
import { MapPin, Package, User, CheckCircle, Info, Utensils } from 'lucide-react';
import CountdownTimer from './CountdownTimer.jsx';
import DonationDetailModal from './DonationDetailModal.jsx';

const categoryColors = {
  cooked: 'bg-amber-100 text-amber-800 border-amber-200',
  raw: 'bg-green-100 text-green-800 border-green-200',
  packaged: 'bg-blue-100 text-blue-800 border-blue-200',
  beverages: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  bakery: 'bg-orange-100 text-orange-800 border-orange-200',
  other: 'bg-neutral-100 text-neutral-700 border-neutral-200',
};

const dietaryBadges = {
  veg: { label: 'Veg', emoji: '🌱', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'non-veg': { label: 'Non-Veg', emoji: '🍗', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  vegan: { label: 'Vegan', emoji: '🌿', bg: 'bg-green-50 text-green-700 border-green-200' },
  egg: { label: 'Egg', emoji: '🥚', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  other: { label: 'General', emoji: '🍽️', bg: 'bg-neutral-50 text-neutral-700 border-neutral-200' },
};

export default function FoodCard({
  donation,
  onClaim,
  isClaiming,
  showClaimedBy = false,
  onRefresh,
}) {
  const [showModal, setShowModal] = useState(false);
  const provider = donation.donatedBy;
  const claimer = donation.claimedBy;
  const isExpired = new Date(donation.expiryTime) < new Date();
  const isCompleted = donation.status === 'completed';

  const diet = dietaryBadges[donation.dietaryType] || dietaryBadges.veg;

  return (
    <>
      <div
        className={`card flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 border ${
          isCompleted
            ? 'border-emerald-200 bg-emerald-50/30'
            : donation.claimed
            ? 'border-neutral-200 bg-neutral-50/70'
            : isExpired
            ? 'border-red-200 bg-red-50/20 opacity-75'
            : 'border-neutral-200 hover:border-primary-400 hover:shadow-card-hover'
        }`}
      >
        <div>
          {/* Header Row: Badges + Countdown */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Category */}
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                  categoryColors[donation.category] || categoryColors.other
                }`}
              >
                {donation.category}
              </span>

              {/* Dietary */}
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${diet.bg}`}
              >
                <span>{diet.emoji}</span> {diet.label}
              </span>
            </div>

            {/* Expiry Pill */}
            <CountdownTimer expiryTime={donation.expiryTime} compact />
          </div>

          {/* Title & Notes */}
          <div className="mb-4">
            <h3
              onClick={() => setShowModal(true)}
              className="font-display font-bold text-lg text-neutral-900 leading-snug cursor-pointer hover:text-primary-600 transition-colors line-clamp-1"
            >
              {donation.foodName}
            </h3>
            {donation.notes ? (
              <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                {donation.notes}
              </p>
            ) : (
              <p className="text-xs text-neutral-400 mt-1 italic">
                No special handling instructions specified
              </p>
            )}
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-2 bg-neutral-50/80 p-3 rounded-xl border border-neutral-100 mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-neutral-400 uppercase font-bold leading-none">Quantity</p>
                <p className="text-xs font-semibold text-neutral-800 truncate mt-0.5">
                  {donation.quantity}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-neutral-400 uppercase font-bold leading-none">Servings</p>
                <p className="text-xs font-semibold text-neutral-800 truncate mt-0.5">
                  ~{donation.servings || 10} meals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 col-span-2">
              <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-neutral-400 uppercase font-bold leading-none">Location</p>
                <p className="text-xs font-semibold text-neutral-800 truncate mt-0.5">
                  {donation.location}
                </p>
              </div>
            </div>
          </div>

          {/* Provider / Claimer snippet */}
          <div className="flex items-center justify-between text-xs text-neutral-500 mb-3 px-1">
            <span className="flex items-center gap-1 truncate">
              <User className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
              <span className="truncate">Donor: <strong>{provider?.name || 'Provider'}</strong></span>
            </span>
            {provider?.phone && (
              <a
                href={`tel:${provider.phone}`}
                className="text-primary-600 hover:underline font-semibold flex-shrink-0"
              >
                Call
              </a>
            )}
          </div>
        </div>

        {/* Claimed/Completed Status & Actions */}
        <div className="pt-3 border-t border-neutral-100 flex flex-col gap-2">
          {isCompleted ? (
            <div className="flex items-center justify-center gap-2 py-2 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
              <CheckCircle className="w-4 h-4" />
              Handover Completed 🎉
            </div>
          ) : showClaimedBy && donation.claimed && claimer ? (
            <div className="bg-primary-50 rounded-xl p-2.5 text-xs text-primary-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-primary-600" />
                  Claimed by {claimer.name}
                </span>
                {donation.pickupCode && (
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-primary-200 text-primary-700 font-bold">
                    OTP: {donation.pickupCode}
                  </span>
                )}
              </div>
              {claimer.phone && (
                <p className="text-[11px] text-primary-600">NGO Phone: {claimer.phone}</p>
              )}
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="btn-secondary flex-1 text-xs py-2 px-3 flex items-center justify-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              View Details
            </button>

            {!donation.claimed && !isExpired && onClaim && (
              <button
                onClick={() => onClaim(donation._id)}
                disabled={isClaiming}
                className="btn-primary flex-1 text-xs py-2 px-3 flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {isClaiming ? 'Claiming...' : 'Claim Food'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Full Details Modal */}
      {showModal && (
        <DonationDetailModal
          donation={donation}
          onClose={() => setShowModal(false)}
          onClaim={onClaim}
          onRefresh={onRefresh}
          isClaiming={isClaiming}
        />
      )}
    </>
  );
}
