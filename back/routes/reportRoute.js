const express = require("express");
const { report } = require("../controllers/reportController");

const router = express.Router();

router.post("/report", report);

module.exports = router;
