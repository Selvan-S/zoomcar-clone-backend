const express = require("express");
const { getReviews, createReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getReviews);
router.post("/", createReview);

module.exports = router;
