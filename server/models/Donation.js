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

    // Whether an NGO has already claimed this donation
    claimed: {
      type: Boolean,
      default: false,
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

    // Additional notes from the provider
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },

    // Category of food to help NGOs filter
    category: {
      type: String,
      enum: ['cooked', 'raw', 'packaged', 'beverages', 'other'],
      default: 'other',
    },
  },
  {
    timestamps: true,
  }
);

// Index to speed up queries for unclaimed donations sorted by expiry
donationSchema.index({ claimed: 1, expiryTime: 1 });

export default mongoose.model('Donation', donationSchema);
