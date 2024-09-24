const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    unique: true,
    match: [/^\d{10}$/, 'Please fill a valid phone number'], // Assuming phone numbers are 10 digits
  },
  email: {
    type: String,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    minlength: 6,
  },
  address: { type: String },
  profilePhoto: { type: String }, // Store the profile photo path
  facebook: { type: String },
  instagram: { type: String },
  whatsApp: { type: String },

  isAdmin: {
    type: Boolean,
    default: false, // By default, users are not admins
  },

}, { timestamps: true });

// Pre-save middleware to hash the password before saving
userSchema.pre('save', async function (next) {
  if (this.password) { // Only hash the password if it's provided
    if (this.isModified('password') || this.isNew) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Virtual for ID
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Set toJSON to include virtuals
userSchema.set('toJSON', {
  virtuals: true,
});

// Check if model exists, otherwise create it
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Export the User model and schema
exports.User = User;
exports.userSchema = userSchema;
