// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ["paystack", "crypto"],
    required: true,
  },
  transactionHash: { type: String, required: true, unique: true },
  reference: {
    type: String,
    required: true,
  },
  walletAddress: String, // for crypto only
  network: String,       // for crypto only
  status: {
    type: String,
    enum: ["pending", "verified"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Payment", paymentSchema);
