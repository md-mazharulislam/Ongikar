const router = require("express").Router();
const { listPublic } = require("../controllers/managementController");

router.get("/", listPublic);

module.exports = router;
