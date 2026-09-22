import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true }, // e.g., BTC, ETH
  walletAddress: { type: String, required: true },
  status: { type: String, default: 'pending' }, // pending, processed
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Withdrawal', withdrawalSchema);
