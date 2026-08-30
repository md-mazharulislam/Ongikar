const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  getWallet,
  getTransactions,
  addMoney,
  sendMoney,
  withdraw,
  requestMoney,
  payment,
  donation,
  savings,
  investment,
  redeemReward,
  exchange,
} = require("../controllers/walletController");

router.use(protect);

router.get("/", getWallet);
router.get("/transactions", getTransactions);
router.post("/add-money", addMoney);
router.post("/send-money", sendMoney);
router.post("/withdraw", withdraw);
router.post("/request-money", requestMoney);
router.post("/payment", payment);
router.post("/donation", donation);
router.post("/savings", savings);
router.post("/investment", investment);
router.post("/reward/redeem", redeemReward);
router.post("/exchange", exchange);

module.exports = router;
