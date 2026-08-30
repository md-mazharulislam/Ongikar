const User = require("../models/User");
const Wallet = require("../models/Wallet");
const generateToken = require("../utils/generateToken");

const makeAccountId = () => {
  const p1 = Math.floor(100000 + Math.random() * 900000);
  const p2 = Math.floor(100000 + Math.random() * 900000);
  return `${p1}-${p2}`;
};

// @desc  Register a new user + create wallet
// @route POST /api/auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !password) {
      return res.status(400).json({ message: "নাম, ফোন নম্বর ও পাসওয়ার্ড আবশ্যক।" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।" });
    }

    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: "এই ফোন নম্বর দিয়ে ইতিমধ্যে একটি অ্যাকাউন্ট আছে।" });
    }

    const user = await User.create({ name, phone, email, password });

    let accountId = makeAccountId();
    // ensure uniqueness (very low collision chance, loop guards anyway)
    while (await Wallet.findOne({ accountId })) {
      accountId = makeAccountId();
    }

    const wallet = await Wallet.create({
      user: user._id,
      accountId,
      balanceBDT: 0,
      balanceUSD: 0,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      message: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!",
      token,
      user: user.toSafeObject(),
      wallet,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Login user
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: "ফোন নম্বর ও পাসওয়ার্ড দিন।" });
    }

    const user = await User.findOne({ phone }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "ফোন নম্বর বা পাসওয়ার্ড সঠিক নয়।" });
    }

    const token = generateToken(user._id);
    res.json({
      message: "লগইন সফল হয়েছে!",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get current logged-in user
// @route GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const wallet = await require("../models/Wallet").findOne({ user: req.user._id });
    res.json({ user: req.user.toSafeObject(), wallet });
  } catch (err) {
    next(err);
  }
};
