// User model — stores registered providers (restaurants, hostels, etc.) and NGOs
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // Display name of the user or organisation
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },

    // Unique email used for login
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    // Hashed password — never stored in plain text
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },

    // 'provider' = restaurant/hostel/canteen/wedding hall donating food
    // 'ngo'      = NGO/orphanage/shelter claiming food
    role: {
      type: String,
      enum: ['provider', 'ngo'],
      required: [true, 'Role is required'],
    },

    // Optional: short bio or description of the organisation
    description: {
      type: String,
      default: '',
      maxlength: 300,
    },

    // Optional contact phone number
    phone: {
      type: String,
      default: '',
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps
    timestamps: true,
  }
);

// Hash the password before saving if it has been modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method — compare a plain-text password with the stored hash
userSchema.methods.comparePassword = function (plainText) {
  return bcrypt.compare(plainText, this.password);
};

// Strip out the password when converting the document to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
