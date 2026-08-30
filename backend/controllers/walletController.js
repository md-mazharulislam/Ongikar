const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const withTransaction = require("../utils/withTransaction");

const getOwnWallet = async (userId) => Wallet.findOne({ user: userId });

const WALLET_NOT_FOUND = "আপনার ওয়ালেট পাওয়া যায়নি। অনুগ্রহ করে সাপোর্টের সাথে যোগাযোগ করুন।";

// @desc  Get my wallet
// @route GET /api/wallet
exports.getWallet = async (req, res, next) => {
  try {
    const wallet = await getOwnWallet(req.user._id);
    if (!wallet) return res.status(404).json({ message: WALLET_NOT_FOUND });
    res.json({ wallet });
  } catch (err) {
    next(err);
  }
};

// @desc  Get my transactions (mini statement)
// @route GET /api/wallet/transactions
exports.getTransactions = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
};

const earnPoints = (amount, rate) => Math.floor((amount / rate.per) * rate.pts);

// @desc  Add money to wallet
// @route POST /api/wallet/add-money
exports.addMoney = async (req, res, next) => {
  try {
    const { amount, method } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: "সঠিক পরিমাণ দিন।" });

    const wallet = await getOwnWallet(req.user._id);
    if (!wallet) return res.status(404).json({ message: WALLET_NOT_FOUND });

    wallet.balanceBDT += amt;
    await wallet.save();

    const tx = await Transaction.create({
      user: req.user._id,
      type: "add_money",
      amount: amt,
      currency: "BDT",
      method: method || "wallet",
      status: "completed",
    });

    res.status(201).json({ message: `৳${amt} সফলভাবে যোগ হয়েছে।`, wallet, transaction: tx });
  } catch (err) {
    next(err);
  }
};

// @desc  Send money to another user's account ID (atomic across both wallets)
// @route POST /api/wallet/send-money
exports.sendMoney = async (req, res, next) => {
  try {
    const { recipientAccountId, amount, note } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: "সঠিক পরিমাণ দিন।" });
    if (!recipientAccountId) return res.status(400).json({ message: "প্রাপকের অ্যাকাউন্ট আইডি দিন।" });

    const senderWallet = await getOwnWallet(req.user._id);
    if (!senderWallet) return res.status(404).json({ message: WALLET_NOT_FOUND });

    const recipientWallet = await Wallet.findOne({ accountId: recipientAccountId });
    if (!recipientWallet) {
      return res.status(404).json({ message: "প্রাপকের অ্যাকাউন্ট পাওয়া যায়নি।" });
    }
    if (String(recipientWallet.user) === String(req.user._id)) {
      return res.status(400).json({ message: "নিজের অ্যাকাউন্টে টাকা পাঠানো যাবে না।" });
    }
    if (senderWallet.balanceBDT < amt) {
      return res.status(400).json({ message: "অপর্যাপ্ত ব্যালেন্স।" });
    }

    const points = earnPoints(amt, { per: 500, pts: 15 });

    const sentTx = await withTransaction(async (session) => {
      // Re-read inside the transaction to avoid a stale-balance race when
      // two requests hit the same wallet at once.
      const opts = session ? { session } : {};
      const freshSender = await Wallet.findById(senderWallet._id, null, opts);
      if (freshSender.balanceBDT < amt) {
        const err = new Error("অপর্যাপ্ত ব্যালেন্স।");
        err.statusCode = 400;
        throw err;
      }

      freshSender.balanceBDT -= amt;
      freshSender.rewardPoints += points;
      await freshSender.save(opts);

      const freshRecipient = await Wallet.findById(recipientWallet._id, null, opts);
      freshRecipient.balanceBDT += amt;
      await freshRecipient.save(opts);

      const [createdSentTx] = await Transaction.create(
        [
          {
            user: req.user._id,
            type: "send_money",
            amount: amt,
            currency: "BDT",
            counterpartyAccountId: recipientAccountId,
            note,
            rewardPointsChange: points,
          },
        ],
        opts
      );
      await Transaction.create(
        [
          {
            user: recipientWallet.user,
            type: "receive_money",
            amount: amt,
            currency: "BDT",
            counterpartyAccountId: senderWallet.accountId,
            note,
          },
        ],
        opts
      );

      return createdSentTx;
    });

    const updatedSenderWallet = await getOwnWallet(req.user._id);
    res.status(201).json({
      message: `৳${amt} সফলভাবে পাঠানো হয়েছে।`,
      wallet: updatedSenderWallet,
      transaction: sentTx,
    });
  } catch (err) {
    if (err.statusCode) return res.status(err.statusCode).json({ message: err.message });
    next(err);
  }
};

// @desc  Withdraw money via bank/bkash/nagad/rocket
// @route POST /api/wallet/withdraw
exports.withdraw = async (req, res, next) => {
  try {
    const { amount, method } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: "সঠিক পরিমাণ দিন।" });
    if (!["bank", "bkash", "nagad", "rocket"].includes(method)) {
      return res.status(400).json({ message: "উত্তোলন পদ্ধতি নির্বাচন করুন।" });
    }

    const wallet = await getOwnWallet(req.user._id);
    if (!wallet) return res.status(404).json({ message: WALLET_NOT_FOUND });
    if (wallet.balanceBDT < amt) return res.status(400).json({ message: "অপর্যাপ্ত ব্যালেন্স।" });

    wallet.balanceBDT -= amt;
    await wallet.save();

    const tx = await Transaction.create({
      user: req.user._id,
      type: "withdraw",
      amount: amt,
      currency: "BDT",
      method,
      status: "pending",
    });

    res.status(201).json({ message: `৳${amt} উত্তোলনের অনুরোধ গৃহীত হয়েছে।`, wallet, transaction: tx });
  } catch (err) {
    next(err);
  }
};

// @desc  Request money from another account (creates a pending request; no funds move
//        until the counterparty acts on it — this is a lightweight IOU-style stub)
// @route POST /api/wallet/request-money
exports.requestMoney = async (req, res, next) => {
  try {
    const { senderAccountId, amount, returnDate, reference } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: "সঠিক পরিমাণ দিন।" });
    if (!senderAccountId) return res.status(400).json({ message: "প্রেরকের অ্যাকাউন্ট আইডি দিন।" });

    const targetWallet = await Wallet.findOne({ accountId: senderAccountId });
    if (!targetWallet) return res.status(404).json({ message: "অ্যাকাউন্ট পাওয়া যায়নি।" });
    if (String(targetWallet.user) === String(req.user._id)) {
      return res.status(400).json({ message: "নিজের কাছ থেকে টাকা অনুরোধ করা যাবে না।" });
    }

    const tx = await Transaction.create({
      user: req.user._id,
      type: "receive_money",
      amount: amt,
      currency: "BDT",
      counterpartyAccountId: senderAccountId,
      note: `অনুরোধ | ফেরতের তারিখ: ${returnDate || "N/A"} | ${reference || ""}`,
      status: "pending",
    });

    res.status(201).json({ message: "টাকা অনুরোধ পাঠানো হয়েছে।", transaction: tx });
  } catch (err) {
    next(err);
  }
};

// @desc  Make a payment (shopping/bills)
// @route POST /api/wallet/payment
exports.payment = async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: "সঠিক পরিমাণ দিন।" });

    const wallet = await getOwnWallet(req.user._id);
    if (!wallet) return res.status(404).json({ message: WALLET_NOT_FOUND });
    if (wallet.balanceBDT < amt) return res.status(400).json({ message: "অপর্যাপ্ত ব্যালেন্স।" });

    wallet.balanceBDT -= amt;
    const points = earnPoints(amt, { per: 500, pts: 10 });
    wallet.rewardPoints += points;
    await wallet.save();

    const tx = await Transaction.create({
      user: req.user._id,
      type: "payment",
      amount: amt,
      currency: "BDT",
      note,
      rewardPointsChange: points,
    });

    res.status(201).json({ message: `৳${amt} পেমেন্ট সম্পন্ন হয়েছে।`, wallet, transaction: tx });
  } catch (err) {
    next(err);
  }
};

// @desc  Donate money
// @route POST /api/wallet/donation
exports.donation = async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: "সঠিক পরিমাণ দিন।" });

    const wallet = await getOwnWallet(req.user._id);
    if (!wallet) return res.status(404).json({ message: WALLET_NOT_FOUND });
    if (wallet.balanceBDT < amt) return res.status(400).json({ message: "অপর্যাপ্ত ব্যালেন্স।" });

    wallet.balanceBDT -= amt;
    const points = earnPoints(amt, { per: 100, pts: 5 });
    wallet.rewardPoints += points;
    await wallet.save();

    const tx = await Transaction.create({
      user: req.user._id,
      type: "donation",
      amount: amt,
      currency: "BDT",
      note,
      rewardPointsChange: points,
    });

    res.status(201).json({ message: "অনুদানের জন্য ধন্যবাদ! মানবতার পাশে থাকার জন্য কৃতজ্ঞ।", wallet, transaction: tx });
  } catch (err) {
    next(err);
  }
};

// @desc  Move money to savings / DPS
// @route POST /api/wallet/savings
exports.savings = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: "সঠিক পরিমাণ দিন।" });

    const wallet = await getOwnWallet(req.user._id);
    if (!wallet) return res.status(404).json({ message: WALLET_NOT_FOUND });
    if (wallet.balanceBDT < amt) return res.status(400).json({ message: "অপর্যাপ্ত ব্যালেন্স।" });

    wallet.balanceBDT -= amt;
    wallet.savings += amt;
    const points = earnPoints(amt, { per: 500, pts: 10 });
    wallet.rewardPoints += points;
    await wallet.save();

    const tx = await Transaction.create({
      user: req.user._id,
      type: "savings",
      amount: amt,
      currency: "BDT",
      rewardPointsChange: points,
    });

    res.status(201).json({ message: `৳${amt} সঞ্চয়ে জমা হয়েছে।`, wallet, transaction: tx });
  } catch (err) {
    next(err);
  }
};

// @desc  Invest money (placeholder ledger entry)
// @route POST /api/wallet/investment
exports.investment = async (req, res, next) => {
  try {
    const { amount, note } = req.body;
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: "সঠিক পরিমাণ দিন।" });

    const wallet = await getOwnWallet(req.user._id);
    if (!wallet) return res.status(404).json({ message: WALLET_NOT_FOUND });
    if (wallet.balanceBDT < amt) return res.status(400).json({ message: "অপর্যাপ্ত ব্যালেন্স।" });

    wallet.balanceBDT -= amt;
    await wallet.save();

    const tx = await Transaction.create({
      user: req.user._id,
      type: "investment",
      amount: amt,
      currency: "BDT",
      note,
    });

    res.status(201).json({ message: `৳${amt} বিনিয়োগ করা হয়েছে।`, wallet, transaction: tx });
  } catch (err) {
    next(err);
  }
};

// @desc  Redeem reward points to wallet balance (10 pts = ৳1)
// @route POST /api/wallet/reward/redeem
exports.redeemReward = async (req, res, next) => {
  try {
    const { points } = req.body;
    const pts = Number(points);
    if (!pts || pts < 1000) {
      return res.status(400).json({ message: "সর্বনিম্ন ১,০০০ পয়েন্ট রিডিম করা যাবে।" });
    }

    const wallet = await getOwnWallet(req.user._id);
    if (!wallet) return res.status(404).json({ message: WALLET_NOT_FOUND });
    if (wallet.rewardPoints < pts) {
      return res.status(400).json({ message: "পর্যাপ্ত রিওয়ার্ড পয়েন্ট নেই।" });
    }

    const bdtValue = pts / 10;
    wallet.rewardPoints -= pts;
    wallet.balanceBDT += bdtValue;
    await wallet.save();

    const tx = await Transaction.create({
      user: req.user._id,
      type: "reward_redeem",
      amount: bdtValue,
      currency: "BDT",
      rewardPointsChange: -pts,
      note: `${pts} পয়েন্ট রিডিম করা হয়েছে`,
    });

    res.status(201).json({ message: `${pts} পয়েন্ট রিডিম করে ৳${bdtValue} যোগ হয়েছে।`, wallet, transaction: tx });
  } catch (err) {
    next(err);
  }
};

// @desc  Exchange recyclable items (cigarette paper / tobacco / cotton / dolls) for cash
// @route POST /api/wallet/exchange
exports.exchange = async (req, res, next) => {
  try {
    const Item = require("../models/Item");
    const { itemId, quantity } = req.body;
    const qty = Number(quantity);
    if (!itemId || !qty || qty <= 0) {
      return res.status(400).json({ message: "আইটেম ও সঠিক পরিমাণ নির্বাচন করুন।" });
    }

    const item = await Item.findById(itemId);
    if (!item || !item.active) return res.status(404).json({ message: "আইটেম পাওয়া যায়নি।" });

    const wallet = await getOwnWallet(req.user._id);
    if (!wallet) return res.status(404).json({ message: WALLET_NOT_FOUND });

    const earnedAmount = Math.round(qty * item.ratePerUnitBDT * 100) / 100;

    wallet.balanceBDT += earnedAmount;
    await wallet.save();

    req.user.ordersCount += 1;
    await req.user.save();

    const tx = await Transaction.create({
      user: req.user._id,
      type: "exchange",
      amount: earnedAmount,
      currency: "BDT",
      note: `${item.nameBn} — ${qty} ${item.unit}`,
    });

    res.status(201).json({
      message: `${item.nameBn} বিনিময়ে ৳${earnedAmount} জমা হয়েছে। ধন্যবাদ!`,
      wallet,
      transaction: tx,
    });
  } catch (err) {
    next(err);
  }
};
