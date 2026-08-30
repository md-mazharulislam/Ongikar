const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: "" },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    address: { type: String, default: "" },
    dob: { type: Date },
    avatar: { type: String, default: "" },
    coverPhoto: { type: String, default: "" },
    memberSince: { type: Date, default: Date.now },
    membershipTier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum"],
      default: "Silver",
    },
    ordersCount: { type: Number, default: 0 },
    language: { type: String, enum: ["bn", "en"], default: "bn" },
    notificationChannel: {
      type: String,
      enum: ["sms", "email", "push"],
      default: "sms",
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
