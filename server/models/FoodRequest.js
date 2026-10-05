// FoodRequest model — allows NGOs to broadcast urgent food needs to providers
import mongoose from 'mongoose';

const foodRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
      maxlength: 120,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    servingsNeeded: {
      type: Number,
      required: [true, 'Number of servings is required'],
      min: 1,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    neededBy: {
      type: Date,
      required: [true, 'Needed by date/time is required'],
    },
    category: {
      type: String,
      enum: ['cooked', 'raw', 'packaged', 'beverages', 'bakery', 'any'],
      default: 'cooked',
    },
    dietaryType: {
      type: String,
      enum: ['veg', 'non-veg', 'vegan', 'any'],
      default: 'veg',
    },
    urgency: {
      type: String,
      enum: ['critical', 'high', 'normal'],
      default: 'high',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ['open', 'fulfilled', 'closed'],
      default: 'open',
    },
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    fulfilledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

foodRequestSchema.index({ status: 1, neededBy: 1 });
foodRequestSchema.index({ requestedBy: 1 });

export default mongoose.model('FoodRequest', foodRequestSchema);
