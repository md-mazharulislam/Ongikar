const TeamMember = require("../models/TeamMember");

// @desc  Public list of active team members, grouped implicitly by category+order
// @route GET /api/management
exports.listPublic = async (req, res, next) => {
  try {
    const members = await TeamMember.find({ active: true }).sort({ category: 1, order: 1, createdAt: 1 });
    res.json({ members });
  } catch (err) {
    next(err);
  }
};

// @desc  Admin: list all (including inactive)
// @route GET /api/admin/management
exports.listAll = async (req, res, next) => {
  try {
    const members = await TeamMember.find().sort({ category: 1, order: 1, createdAt: 1 });
    res.json({ members });
  } catch (err) {
    next(err);
  }
};

// @desc  Admin: create a team member
// @route POST /api/admin/management
exports.create = async (req, res, next) => {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json({ message: "সদস্য যোগ করা হয়েছে।", member });
  } catch (err) {
    next(err);
  }
};

// @desc  Admin: update a team member
// @route PUT /api/admin/management/:id
exports.update = async (req, res, next) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ message: "সদস্য পাওয়া যায়নি।" });
    res.json({ message: "হালনাগাদ করা হয়েছে।", member });
  } catch (err) {
    next(err);
  }
};

// @desc  Admin: delete a team member
// @route DELETE /api/admin/management/:id
exports.remove = async (req, res, next) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ message: "সদস্য মুছে ফেলা হয়েছে।" });
  } catch (err) {
    next(err);
  }
};
