const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "অনুমতি নেই। অনুগ্রহ করে লগইন করুন।" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "ব্যবহারকারী পাওয়া যায়নি বা নিষ্ক্রিয়।" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "টোকেন অবৈধ বা মেয়াদোত্তীর্ণ।" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "শুধুমাত্র অ্যাডমিনের জন্য অনুমোদিত।" });
  }
  next();
};

module.exports = { protect, adminOnly };
