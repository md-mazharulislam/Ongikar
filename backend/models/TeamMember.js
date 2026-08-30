const mongoose = require("mongoose");

const TeamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designationBn: { type: String, required: true }, // e.g. প্রতিষ্ঠাতা, সহ-প্রতিষ্ঠাতা, উপদেষ্টা
    designationEn: { type: String, default: "" },
    category: {
      type: String,
      enum: ["founder", "co-founder", "advisor", "team", "volunteer"],
      default: "team",
    },
    bio: { type: String, default: "" },
    photo: { type: String, default: "" }, // URL or base64 data URL
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    facebook: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    order: { type: Number, default: 0 }, // display order, lower first
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamMember", TeamMemberSchema);
