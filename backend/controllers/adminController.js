const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const Item = require("../models/Item");

// @desc  Dashboard summary stats
// @route GET /api/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [userCount, activeUserCount, walletAgg, txCount, itemCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalBDT: { $sum: "$balanceBDT" },
            totalUSD: { $sum: "$balanceUSD" },
            totalRewardPoints: { $sum: "$rewardPoints" },
            totalSavings: { $sum: "$savings" },
          },
        },
      ]),
      Transaction.countDocuments(),
      Item.countDocuments({ active: true }),
    ]);

    const totals = walletAgg[0] || { totalBDT: 0, totalUSD: 0, totalRewardPoints: 0, totalSavings: 0 };

    res.json({
      userCount,
      activeUserCount,
      itemCount,
      transactionCount: txCount,
      ...totals,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  List users (paginated, searchable by name/phone/email)
// @route GET /api/admin/users?search=&page=&limit=
exports.listUsers = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const search = (req.query.search || "").trim();

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    const userIds = users.map((u) => u._id);
    const wallets = await Wallet.find({ user: { $in: userIds } });
    const walletByUser = Object.fromEntries(wallets.map((w) => [String(w.user), w]));

    const combined = users.map((u) => ({
      ...u.toSafeObject(),
      wallet: walletByUser[String(u._id)] || null,
    }));

    res.json({ users: combined, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single user + wallet detail
// @route GET /api/admin/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি।" });
    const wallet = await Wallet.findOne({ user: user._id });
    res.json({ user: user.toSafeObject(), wallet });
  } catch (err) {
    next(err);
  }
};

// @desc  Update a user's role / active status / basic info
// @route PUT /api/admin/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { role, isActive, name, email, phone } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি।" });

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;

    await user.save();
    res.json({ message: "ব্যবহারকারী হালনাগাদ করা হয়েছে।", user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete (permanently remove) a user + their wallet
// @route DELETE /api/admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Wallet.findOneAndDelete({ user: req.params.id });
    res.json({ message: "ব্যবহারকারী মুছে ফেলা হয়েছে।" });
  } catch (err) {
    next(err);
  }
};

// @desc  Admin manual wallet adjustment (credit or debit) with an audit transaction
// @route PUT /api/admin/users/:id/wallet
exports.adjustWallet = async (req, res, next) => {
  try {
    const { amount, currency, note } = req.body;
    const amt = Number(amount);
    if (!amt) return res.status(400).json({ message: "সঠিক পরিমাণ দিন (ধনাত্মক = জমা, ঋণাত্মক = কর্তন)।" });

    const wallet = await Wallet.findOne({ user: req.params.id });
    if (!wallet) return res.status(404).json({ message: "ওয়ালেট পাওয়া যায়নি।" });

    const field = currency === "USD" ? "balanceUSD" : "balanceBDT";
    const newBalance = wallet[field] + amt;
    if (newBalance < 0) return res.status(400).json({ message: "ব্যালেন্স ঋণাত্মক হতে পারবে না।" });

    wallet[field] = newBalance;
    await wallet.save();

    await Transaction.create({
      user: req.params.id,
      type: amt >= 0 ? "add_money" : "withdraw",
      amount: Math.abs(amt),
      currency: currency === "USD" ? "USD" : "BDT",
      note: `[অ্যাডমিন সমন্বয়] ${note || ""}`.trim(),
    });

    res.json({ message: "ওয়ালেট সমন্বয় করা হয়েছে।", wallet });
  } catch (err) {
    next(err);
  }
};

// @desc  List all transactions across all users (paginated, optional user filter)
// @route GET /api/admin/transactions?userId=&page=&limit=
exports.listTransactions = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const filter = req.query.userId ? { user: req.query.userId } : {};

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("user", "name phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({ transactions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
