require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const ensureBootstrapData = require("./utils/bootstrap");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const walletRoutes = require("./routes/walletRoutes");
const itemRoutes = require("./routes/itemRoutes");
const managementRoutes = require("./routes/managementRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "Ongikar API" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/management", managementRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(async () => {
    try {
      await ensureBootstrapData();
    } catch (err) {
      // Bootstrap (auto-seeding default items / admin account) is a
      // convenience, not a hard requirement — a failure here (e.g. a
      // transient issue right after the DB container starts) must never
      // take down the whole API. Log it and keep going; `npm run seed`
      // can always be run manually afterwards.
      console.error("[Bootstrap] স্বয়ংক্রিয় সিডিং ব্যর্থ হয়েছে (সার্ভার তবুও চালু থাকবে):", err.message);
    }
    app.listen(PORT, () => {
      console.log(`🚀 Ongikar API চলছে http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[Startup] ডাটাবেস সংযোগ ব্যর্থ হয়েছে, সার্ভার বন্ধ করা হচ্ছে:", err.message);
    process.exit(1);
  });

module.exports = app;
