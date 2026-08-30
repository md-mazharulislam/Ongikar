const User = require("../models/User");
const PaymentMethod = require("../models/PaymentMethod");
const bcrypt = require("bcryptjs");

// @desc  Update profile (name, email, phone, address, dob)
// @route PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const fields = ["name", "email", "phone", "address", "dob"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) req.user[f] = req.body[f];
    });
    await req.user.save();
    res.json({ message: "প্রোফাইল সফলভাবে হালনাগাদ হয়েছে।", user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc  Update avatar / cover photo (base64 data URL or external URL)
// @route PUT /api/users/photo
exports.updatePhoto = async (req, res, next) => {
  try {
    const { avatar, coverPhoto } = req.body;
    if (avatar !== undefined) req.user.avatar = avatar;
    if (coverPhoto !== undefined) req.user.coverPhoto = coverPhoto;
    await req.user.save();
    res.json({ message: "ছবি হালনাগাদ হয়েছে।", user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc  Update settings (language, notification channel, password)
// @route PUT /api/users/settings
exports.updateSettings = async (req, res, next) => {
  try {
    const { language, notificationChannel, currentPassword, newPassword } = req.body;
    if (language) req.user.language = language;
    if (notificationChannel) req.user.notificationChannel = notificationChannel;

    if (newPassword) {
      const fullUser = await User.findById(req.user._id).select("+password");
      if (!currentPassword || !(await fullUser.comparePassword(currentPassword))) {
        return res.status(400).json({ message: "বর্তমান পাসওয়ার্ড সঠিক নয়।" });
      }
      fullUser.password = newPassword;
      await fullUser.save();
    }

    await req.user.save();
    res.json({ message: "সেটিংস সংরক্ষণ করা হয়েছে।", user: req.user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc  Deactivate account
// @route DELETE /api/users/me
exports.deactivateAccount = async (req, res, next) => {
  try {
    req.user.isActive = false;
    await req.user.save();
    res.json({ message: "অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে।" });
  } catch (err) {
    next(err);
  }
};

// ── Payment methods ──

// @desc  List payment methods
// @route GET /api/users/payment-methods
exports.listPaymentMethods = async (req, res, next) => {
  try {
    const methods = await PaymentMethod.find({ user: req.user._id }).select("-mfsPinHash");
    res.json({ methods });
  } catch (err) {
    next(err);
  }
};

// @desc  Add / upsert a payment method
// @route POST /api/users/payment-methods
exports.addPaymentMethod = async (req, res, next) => {
  try {
    const { type, bankName, accountNumber, routingNumber, mfsNumber, mfsPin } = req.body;
    if (!["bank", "bkash", "nagad", "rocket"].includes(type)) {
      return res.status(400).json({ message: "পেমেন্ট পদ্ধতির ধরন সঠিক নয়।" });
    }

    const data = { user: req.user._id, type };
    if (type === "bank") {
      Object.assign(data, { bankName, accountNumber, routingNumber });
    } else {
      data.mfsNumber = mfsNumber;
      if (mfsPin) data.mfsPinHash = await bcrypt.hash(String(mfsPin), 10);
    }

    const method = await PaymentMethod.findOneAndUpdate(
      { user: req.user._id, type },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select("-mfsPinHash");

    res.status(201).json({ message: "পেমেন্ট পদ্ধতি সংরক্ষণ করা হয়েছে।", method });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete a payment method
// @route DELETE /api/users/payment-methods/:id
exports.deletePaymentMethod = async (req, res, next) => {
  try {
    await PaymentMethod.deleteOne({ _id: req.params.id, user: req.user._id });
    res.json({ message: "পেমেন্ট পদ্ধতি মুছে ফেলা হয়েছে।" });
  } catch (err) {
    next(err);
  }
};
