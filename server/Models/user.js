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

}, { timestamps: true });

export default mongoose.model("User", UserSchema);
