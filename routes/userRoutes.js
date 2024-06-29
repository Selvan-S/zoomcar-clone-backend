const express = require("express");
const {
  updateUserDetails,
  forgotPassword,
  resetPassword,
  uploadImg,
  getUserHostedVehicleStatus,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getUserHostedVehicleStatus", protect, getUserHostedVehicleStatus);
router.put("/update", protect, updateUserDetails);
router.post("/forgotpassword", forgotPassword);
router.put("/passwordreset/:resetToken", resetPassword);
router.post("/upload", protect, uploadImg);
module.exports = router;
