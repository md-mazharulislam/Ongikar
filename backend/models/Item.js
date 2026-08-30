const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
  {
    nameBn: { type: String, required: true },
    nameEn: { type: String, required: true },
    image: { type: String, default: "" },
    unit: { type: String, enum: ["kg", "piece"], default: "kg" },
    stock: { type: Number, default: 0 },
    ratePerUnitBDT: { type: Number, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);
