const Item = require("../models/Item");
const User = require("../models/User");
const Wallet = require("../models/Wallet");

const DEFAULT_ITEMS = [
  { nameBn: "সিগারেটের কাগজ", nameEn: "Cigarette paper", unit: "kg", stock: 500, ratePerUnitBDT: 25, image: "cigarettes.jpg" },
  { nameBn: "তামাক", nameEn: "Tobacco", unit: "kg", stock: 300, ratePerUnitBDT: 40, image: "tobacco.jpg" },
  { nameBn: "তুলা", nameEn: "Cotton", unit: "kg", stock: 400, ratePerUnitBDT: 60, image: "cotton-fiber.webp" },
  { nameBn: "তুলার পুতুল", nameEn: "Cotton dolls", unit: "piece", stock: 100, ratePerUnitBDT: 15, image: "doll.jpg" },
];

const makeAccountId = () => {
  const p1 = Math.floor(100000 + Math.random() * 900000);
  const p2 = Math.floor(100000 + Math.random() * 900000);
  return `${p1}-${p2}`;
};

/**
 * Runs once at server startup. Guarantees a brand-new database (e.g. a
 * freshly created Atlas cluster, or a fresh local/Docker Mongo) is never
 * left completely empty — new sign-ups always see exchange items on the
 * Home page, and there's always at least one admin account to access the
 * admin panel.
 */
async function ensureBootstrapData() {
  // ── Exchange items ──
  const itemCount = await Item.countDocuments();
  if (itemCount === 0) {
    await Item.insertMany(DEFAULT_ITEMS);
    console.log(`[Bootstrap] ${DEFAULT_ITEMS.length}টি ডিফল্ট এক্সচেঞ্জ আইটেম যোগ করা হয়েছে (DB খালি ছিল)।`);
  }

  // ── Admin account ──
  const adminExists = await User.findOne({ role: "admin" });
  if (!adminExists) {
    const phone = process.env.ADMIN_PHONE || "+8801900000000";
    const password = process.env.ADMIN_PASSWORD || "admin12345";
    const name = process.env.ADMIN_NAME || "Ongikar Admin";

    let user = await User.findOne({ phone });
    if (user) {
      user.role = "admin";
      await user.save();
    } else {
      user = await User.create({ name, phone, password, role: "admin" });
      await Wallet.create({ user: user._id, accountId: makeAccountId() });
    }
    console.log(`[Bootstrap] অ্যাডমিন অ্যাকাউন্ট প্রস্তুত — ফোন: ${phone} / পাসওয়ার্ড: ${password}`);
    console.log("[Bootstrap] ⚠ প্রোডাকশনে ADMIN_PHONE ও ADMIN_PASSWORD এনভায়রনমেন্ট ভ্যারিয়েবল দিয়ে এটি পরিবর্তন করুন।");
  }
}

module.exports = ensureBootstrapData;
