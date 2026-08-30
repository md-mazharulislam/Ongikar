const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const { listItems, createItem, updateItem, deleteItem } = require("../controllers/itemController");

router.get("/", listItems);
router.post("/", protect, adminOnly, createItem);
router.put("/:id", protect, adminOnly, updateItem);
router.delete("/:id", protect, adminOnly, deleteItem);

module.exports = router;
