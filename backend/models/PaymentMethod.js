const mongoose = require("mongoose");

const PaymentMethodSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["bank", "bkash", "nagad", "rocket"], required: true },
    // Bank
    bankName: String,
    accountNumber: String,
    routingNumber: String,
    // MFS (bkash / nagad / rocket)
    mfsNumber: String,
    mfsPinHash: String,
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", PaymentMethodSchema);
