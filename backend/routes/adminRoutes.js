const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");

const {
  getStats,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  adjustWallet,
  listTransactions,
} = require("../controllers/adminController");

const {
  listAll: listAllTeamMembers,
  create: createTeamMember,
  update: updateTeamMember,
  remove: removeTeamMember,
} = require("../controllers/managementController");

const {
  listAllItems,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/itemController");

router.use(protect, adminOnly);

router.get("/stats", getStats);

router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/wallet", adjustWallet);

router.get("/transactions", listTransactions);

// এক্সচেঞ্জ আইটেম ব্যবস্থাপনা
router.get("/items", listAllItems);
router.post("/items", createItem);
router.put("/items/:id", updateItem);
router.delete("/items/:id", deleteItem);

// ম্যানেজমেন্ট / ফাউন্ডার টিম ব্যবস্থাপনা
router.get("/management", listAllTeamMembers);
router.post("/management", createTeamMember);
router.put("/management/:id", updateTeamMember);
router.delete("/management/:id", removeTeamMember);

module.exports = router;
