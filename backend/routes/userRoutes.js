const router = require("express").Router();
const { protect } = require("../middleware/auth");
const {
  updateProfile,
  updatePhoto,
  updateSettings,
  deactivateAccount,
  listPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
} = require("../controllers/userController");

router.use(protect);

router.put("/profile", updateProfile);
router.put("/photo", updatePhoto);
router.put("/settings", updateSettings);
router.delete("/me", deactivateAccount);

router.get("/payment-methods", listPaymentMethods);
router.post("/payment-methods", addPaymentMethod);
router.delete("/payment-methods/:id", deletePaymentMethod);

module.exports = router;
