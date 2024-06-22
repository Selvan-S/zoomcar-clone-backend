const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { createPayment } = require("../controllers/paymentController");

router.post("/create-checkout-session/:id", protect, createPayment);

module.exports = router;
