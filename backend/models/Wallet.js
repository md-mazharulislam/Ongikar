const mongoose = require("mongoose");

const WalletSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balanceBDT: { type: Number, default: 0, min: 0 },
    balanceUSD: { type: Number, default: 0, min: 0 },
    cardNumberLast4: { type: String, default: "4821" },
    cardTier: { type: String, enum: ["Silver", "Gold", "Platinum"], default: "Silver" },
    cardExpiry: { type: String, default: "12/35" },
    rewardPoints: { type: Number, default: 0 },
    savings: { type: Number, default: 0 },
    accountId: { type: String, unique: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", WalletSchema);
