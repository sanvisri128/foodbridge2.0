// Donation model — represents a food donation posted by a provider
import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    // Name / description of the food being donated (e.g. "Rice and Dal")
    foodName: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: [100, 'Food name cannot exceed 100 characters'],
    },

    // How much food is available (e.g. "50 meals", "10 kg")
    quantity: {
      type: String,
      required: [true, 'Quantity is required'],
      trim: true,
    },

    // Estimated number of meal portions/servings (for platform impact calculation)
    servings: {
      type: Number,
      default: 10,
      min: 1,
    },

    // Address or area where the food can be picked up
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },

    // When the food expires / must be picked up by
    expiryTime: {
      type: Date,
      required: [true, 'Expiry time is required'],
    },

    // Reference to the User (provider) who created this donation
    donatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Whether an NGO has already claimed this donation (kept for backward compatibility)
    claimed: {
      type: Boolean,
      default: false,
    },

    // Extended status lifecycle: available -> claimed -> completed (or cancelled/expired)
    status: {
      type: String,
      enum: ['available', 'claimed', 'in_transit', 'completed', 'cancelled', 'expired'],
      default: 'available',
    },

    // 4-digit verification code generated when claimed, verified upon pickup
    pickupCode: {
      type: String,
      default: null,
    },

    // Reference to the NGO that claimed it (null if unclaimed)
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // When the donation was claimed
    claimedAt: {
      type: Date,
      default: null,
    },

    // When the donation was marked completed / picked up
    completedAt: {
      type: Date,
      default: null,
    },

    // Cancellation note if cancelled
    cancellationReason: {
      type: String,
      default: '',
    },

    // Additional notes from the provider (allergens, packaging, pickup instructions)
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },

    // Category of food to help NGOs filter
    category: {
      type: String,
      enum: ['cooked', 'raw', 'packaged', 'beverages', 'bakery', 'other'],
      default: 'cooked',
    },

    // Dietary classification
    dietaryType: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'egg', 'other'],
      default: 'veg',
    },

    // Storage requirement for food safety
    storageRequirement: {
      type: String,
      enum: ['room_temp', 'refrigerated', 'hot', 'frozen'],
      default: 'room_temp',
    },
  },
  {
    timestamps: true,
  }
);

// Synchronize claimed boolean and status field on save
donationSchema.pre('save', function (next) {
  if (this.status === 'claimed' || this.status === 'completed' || this.status === 'in_transit') {
    this.claimed = true;
  } else if (this.status === 'available') {
    this.claimed = false;
  }
  next();
});

// Index to speed up queries for unclaimed donations sorted by expiry
donationSchema.index({ claimed: 1, expiryTime: 1 });
donationSchema.index({ status: 1, expiryTime: 1 });
donationSchema.index({ donatedBy: 1, status: 1 });
donationSchema.index({ claimedBy: 1, status: 1 });

export default mongoose.model('Donation', donationSchema);

