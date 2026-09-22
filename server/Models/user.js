import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSubscribed: { type: Boolean, default: false },
  claimedAirdrops: [{ type: String }], // 🔥 Track claimed airdrops
  subscriptionExpiry: { type: Date, default: null }, // 🆕 Expiry date
  lastExpiryNotification: Date, // Track when expiry emails were sent
  expiryReason: String, // Optional: "auto-expired" vs "manual-cancellation"
  deposited: { type: Number, default: 0 }, // Total wallet balance
  btc_balance: { type: Number, default: 0 },
  eth_balance: { type: Number, default: 0 },
  sol_balance: { type: Number, default: 0 },
  ltc_balance: { type: Number, default: 0 },

  // Only ever store a hash of the reset token, never the raw value — same
  // reasoning as storing a password hash instead of the password itself.
  resetPasswordTokenHash: { type: String, default: null, select: false },
  resetPasswordExpires: { type: Date, default: null, select: false },

}, { timestamps: true });

export default mongoose.model("User", UserSchema);
