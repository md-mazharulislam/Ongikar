const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "add_money",
        "send_money",
        "receive_money",
        "withdraw",
        "payment",
        "donation",
        "savings",
        "investment",
        "exchange",
        "reward_earn",
        "reward_redeem",
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, enum: ["BDT", "USD"], default: "BDT" },
    counterpartyAccountId: { type: String, default: "" },
    method: { type: String, enum: ["bank", "bkash", "nagad", "rocket", "wallet", ""], default: "" },
    note: { type: String, default: "" },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    rewardPointsChange: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
