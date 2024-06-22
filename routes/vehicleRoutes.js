const express = require("express");
const router = express.Router();
const {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").post(protect, admin, createVehicle).get(getVehicles);

router
  .route("/:id")
  .get(getVehicleById)
  .put(protect, admin, updateVehicle)
  .delete(protect, admin, deleteVehicle);

module.exports = router;
