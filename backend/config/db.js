const mongoose = require("mongoose");

const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ongikar";
  try {
    await mongoose.connect(uri);
    console.log(`[MongoDB] সংযুক্ত হয়েছে: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    console.error("[MongoDB] সংযোগ ব্যর্থ হয়েছে:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
