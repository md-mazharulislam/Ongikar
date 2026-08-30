const Item = require("../models/Item");

// @desc  List active exchange items (public)
// @route GET /api/items
exports.listItems = async (req, res, next) => {
  try {
    const items = await Item.find({ active: true }).sort({ createdAt: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// @desc  List ALL exchange items including inactive (admin)
// @route GET /api/admin/items
exports.listAllItems = async (req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: 1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

// @desc  Create item (admin)
// @route POST /api/items
exports.createItem = async (req, res, next) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json({ message: "আইটেম তৈরি হয়েছে।", item });
  } catch (err) {
    next(err);
  }
};

// @desc  Update item (admin)
// @route PUT /api/items/:id
exports.updateItem = async (req, res, next) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: "আইটেম পাওয়া যায়নি।" });
    res.json({ message: "আইটেম হালনাগাদ হয়েছে।", item });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete item (admin)
// @route DELETE /api/items/:id
exports.deleteItem = async (req, res, next) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "আইটেম মুছে ফেলা হয়েছে।" });
  } catch (err) {
    next(err);
  }
};
