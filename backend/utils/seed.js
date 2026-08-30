require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Item = require("../models/Item");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const TeamMember = require("../models/TeamMember");

const items = [
  { nameBn: "সিগারেটের কাগজ", nameEn: "Cigarette paper", unit: "kg", stock: 500, ratePerUnitBDT: 25, image: "cigarettes.jpg" },
  { nameBn: "তামাক", nameEn: "Tobacco", unit: "kg", stock: 300, ratePerUnitBDT: 40, image: "tobacco.jpg" },
  { nameBn: "তুলা", nameEn: "Cotton", unit: "kg", stock: 400, ratePerUnitBDT: 60, image: "cotton-fiber.webp" },
  { nameBn: "তুলার পুতুল", nameEn: "Cotton dolls", unit: "piece", stock: 100, ratePerUnitBDT: 15, image: "doll.jpg" },
];

const teamMembers = [
  {
    name: "MD. Mazharul Islam",
    designationBn: "প্রতিষ্ঠাতা ও প্রধান নির্বাহী",
    designationEn: "Founder & CEO",
    category: "founder",
    bio: "অঙ্গীকার প্রতিষ্ঠার পেছনের মূল উদ্যোক্তা, তামাকজাত বর্জ্য ব্যবস্থাপনা ও কমিউনিটি ওয়ালেট নিয়ে কাজ করছেন।",
    order: 1,
  },
  {
    name: "Ayesha Rahman",
    designationBn: "সহ-প্রতিষ্ঠাতা ও অপারেশন্স প্রধান",
    designationEn: "Co-Founder & Head of Operations",
    category: "co-founder",
    bio: "মাঠপর্যায়ের অপারেশন ও উপকরণ সংগ্রহ প্রক্রিয়া তদারকি করেন।",
    order: 1,
  },
  {
    name: "Dr. Kamal Hossain",
    designationBn: "স্বাস্থ্য উপদেষ্টা",
    designationEn: "Health Advisor",
    category: "advisor",
    bio: "পাবলিক হেলথ বিশেষজ্ঞ, তামাক নিয়ন্ত্রণ ও স্বাস্থ্য সচেতনতা কার্যক্রমে পরামর্শ দেন।",
    order: 1,
  },
];

const run = async () => {
  await connectDB();

  await Item.deleteMany({});
  await Item.insertMany(items);
  console.log(`✔ ${items.length}টি এক্সচেঞ্জ আইটেম যোগ করা হয়েছে`);

  await TeamMember.deleteMany({});
  await TeamMember.insertMany(teamMembers);
  console.log(`✔ ${teamMembers.length}জন ম্যানেজমেন্ট/টিম সদস্য যোগ করা হয়েছে`);

  // ── Demo regular member ──
  const demoPhone = "+8801700000000";
  let demoUser = await User.findOne({ phone: demoPhone });
  if (!demoUser) {
    demoUser = await User.create({
      name: "MD. Mazharul Islam",
      phone: demoPhone,
      email: "demo@ongikar.org",
      password: "password123",
      address: "১২৩ প্রধান সড়ক, ঢাকা, বাংলাদেশ",
    });
    await Wallet.create({
      user: demoUser._id,
      accountId: "624817-738465",
      balanceBDT: 15000,
      balanceUSD: 25,
      rewardPoints: 2450,
    });
    console.log("✔ ডেমো ব্যবহারকারী তৈরি হয়েছে — ফোন: +8801700000000 / পাসওয়ার্ড: password123");
  } else {
    console.log("ℹ ডেমো ব্যবহারকারী ইতিমধ্যে বিদ্যমান");
  }

  // ── Demo admin account ──
  const adminPhone = process.env.ADMIN_PHONE || "+8801900000000";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin12345";
  let adminUser = await User.findOne({ phone: adminPhone });
  if (!adminUser) {
    adminUser = await User.create({
      name: process.env.ADMIN_NAME || "Ongikar Admin",
      phone: adminPhone,
      password: adminPassword,
      role: "admin",
    });
    await Wallet.create({ user: adminUser._id, accountId: "900000-000001" });
    console.log(`✔ অ্যাডমিন অ্যাকাউন্ট তৈরি হয়েছে — ফোন: ${adminPhone} / পাসওয়ার্ড: ${adminPassword}`);
  } else if (adminUser.role !== "admin") {
    adminUser.role = "admin";
    await adminUser.save();
    console.log(`ℹ বিদ্যমান ব্যবহারকারীকে অ্যাডমিন করা হয়েছে — ফোন: ${adminPhone}`);
  } else {
    console.log("ℹ অ্যাডমিন অ্যাকাউন্ট ইতিমধ্যে বিদ্যমান");
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
