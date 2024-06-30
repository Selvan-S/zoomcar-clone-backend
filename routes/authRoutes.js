const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  InsertSignUpUser,
} = require("../controllers/authcontroller");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.get("/:token", InsertSignUpUser);

module.exports = router;
