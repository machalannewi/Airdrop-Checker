import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    transactionHash: { type: String, required: true, unique: true },
    // method: { type: String, required: true }, // e.g., BTC, ETH
    paymentMethod: { type: String, enum: ["Paystack", "Crypto"], required: true },
    walletAddress: String, // for crypto only
    network: String,       // for crypto only
    status: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    reference: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Transaction", TransactionSchema);
