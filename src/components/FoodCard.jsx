// FoodCard — displays a single donation listing
// Used in FoodListingsPage and NGODashboard
import { MapPin, Clock, Package, User, Tag, CheckCircle } from 'lucide-react';

// Format a date into a human-readable "expires in X hours/days" string
function formatExpiry(dateStr) {
  const now = new Date();
  const expiry = new Date(dateStr);
  const diffMs = expiry - now;

  if (diffMs <= 0) return { label: 'Expired', urgent: true };

  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);

  if (diffHrs < 1) return { label: 'Expires < 1 hr', urgent: true };
  if (diffHrs < 6) return { label: `Expires in ${diffHrs}h`, urgent: true };
  if (diffDays < 1) return { label: `Expires in ${diffHrs}h`, urgent: false };
  return { label: `Expires in ${diffDays}d`, urgent: false };
}

// Badge color per food category
const categoryColors = {
  cooked:    'bg-amber-100 text-amber-700',
  raw:       'bg-green-100 text-green-700',
  packaged:  'bg-blue-100 text-blue-700',
  beverages: 'bg-cyan-100 text-cyan-700',
  other:     'bg-neutral-100 text-neutral-600',
};

export default function FoodCard({ donation, onClaim, isClaiming, showClaimedBy }) {
  const { label: expiryLabel, urgent } = formatExpiry(donation.expiryTime);
  const provider = donation.donatedBy;
  const claimer = donation.claimedBy;

  return (
    <div className={`card flex flex-col gap-4 border ${donation.claimed ? 'border-neutral-200 opacity-80' : 'border-transparent hover:border-primary-200'}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg text-neutral-900 leading-snug">
            {donation.foodName}
          </h3>
          {donation.notes && (
            <p className="text-sm text-neutral-500 mt-0.5 line-clamp-2">{donation.notes}</p>
          )}
        </div>

        {/* Category badge */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${categoryColors[donation.category] || categoryColors.other}`}>
          {donation.category}
        </span>
      </div>

      {/* Meta info grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetaItem icon={<Package className="w-4 h-4 text-primary-500" />} label="Quantity">
          {donation.quantity}
        </MetaItem>

        <MetaItem icon={<MapPin className="w-4 h-4 text-primary-500" />} label="Location">
          {donation.location}
        </MetaItem>

        <MetaItem
          icon={<Clock className={`w-4 h-4 ${urgent ? 'text-red-500' : 'text-primary-500'}`} />}
          label="Expiry"
        >
          <span className={urgent ? 'text-red-600 font-semibold' : ''}>{expiryLabel}</span>
        </MetaItem>

        <MetaItem icon={<User className="w-4 h-4 text-primary-500" />} label="Donor">
          {provider?.name || 'Unknown'}
        </MetaItem>
      </div>

      {/* Provider contact */}
      {provider?.phone && (
        <p className="text-xs text-neutral-500 -mt-1">
          Contact: <a href={`tel:${provider.phone}`} className="text-primary-600 hover:underline">{provider.phone}</a>
        </p>
      )}

      {/* Claimed-by info (for provider's "my donations" view) */}
      {showClaimedBy && donation.claimed && claimer && (
        <div className="flex items-center gap-2 bg-primary-50 rounded-lg px-3 py-2 text-sm text-primary-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Claimed by <strong>{claimer.name}</strong>
          {claimer.phone && <> · {claimer.phone}</>}
        </div>
      )}

      {/* Footer — claim button or claimed badge */}
      {!showClaimedBy && (
        donation.claimed ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500 font-medium mt-auto pt-2 border-t border-neutral-100">
            <Tag className="w-4 h-4" />
            Already claimed
          </div>
        ) : (
          onClaim && (
            <button
              onClick={() => onClaim(donation._id)}
              disabled={isClaiming}
              className="btn-primary w-full mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isClaiming ? 'Claiming...' : 'Claim This Donation'}
            </button>
          )
        )
      )}
    </div>
  );
}

// Small icon + label + value component used inside the card
function MetaItem({ icon, label, children }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-xs text-neutral-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm text-neutral-700 font-medium leading-snug">{children}</p>
      </div>
    </div>
  );
}
