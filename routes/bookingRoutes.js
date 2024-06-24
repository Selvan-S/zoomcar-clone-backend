const express = require("express");
const {
  getBookings,
  createBooking,
  updateBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getBookings);
router.put("/", protect, updateBooking);
router.post("/", protect, createBooking);

module.exports = router;
