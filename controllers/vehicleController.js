const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const ErrorResponse = require("../utils/errorResponse");
const { default: mongoose } = require("mongoose");

// Create a new vehicle (Admin)
const createVehicle = async (req, res, next) => {
  const {
    name,
    hostCarImage,
    carType,
    fuelType,
    transmission,
    seats,
    pricePerHour,
    availability,
  } = req.body;
  if (
    !name ||
    !carType ||
    !fuelType ||
    !transmission ||
    !seats ||
    !pricePerHour
  )
    return res.status(400).json({
      error:
        "name, carType, fuelType, transmission, seats and pricePerHour are required",
    });
  try {
    const vehicle = new Vehicle({
      name,
      hostCarImage,
      carType,
      fuelType,
      transmission,
      seats,
      pricePerHour,
      availability,
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    next(new ErrorResponse("Server error", 500));
  }
};

// Get all vehicles
const getVehicles = async (req, res, next) => {
  const { carType, gte, lte } = req.query;

  let pricePerHourQuery = {};
  if (gte) pricePerHourQuery.$gte = parseInt(gte);
  if (lte) pricePerHourQuery.$lte = parseInt(lte);
  pricePerHourQuery = Object.keys(pricePerHourQuery).length
    ? { pricePerHour: pricePerHourQuery }
    : {};

  let pipeline = [];

  if (carType) {
    const seperateCarType = carType.split(",");
    pipeline.push({
      $match: { carType: { $in: seperateCarType } },
    });
  }

  pipeline.push({ $match: pricePerHourQuery });

  if (pipeline.length === 1) {
    pipeline.unshift({ $match: {} });
  }

  pipeline.push();

  // https://mongoplayground.net/p/qOXMeM_-yl6

  const filter = await Vehicle.aggregate(pipeline);

  try {
    res.status(200).json(filter);
  } catch (err) {
    next(new ErrorResponse("Server error", 500));
  }
};

// Get a single vehicle by ID
const getVehicleById = async (req, res, next) => {
  try {
    let pipeline = [
      {
        $match: {
          _id: mongoose.Types.ObjectId.createFromHexString(req.params.id),
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "vehicle",
          as: "reviews",
        },
      },
    ];
    const vehicle = await Vehicle.aggregate(pipeline);
    if (!vehicle.length) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }
    const populateUser = await User.populate(vehicle[0], {
      path: "reviews.user",
      select: "-password",
      strictPopulate: false,
    });
    res.status(200).json(populateUser);
  } catch (err) {
    next(new ErrorResponse("Server error", 500));
  }
};

// Update a vehicle (Admin)
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!vehicle) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }
    res.status(200).json(vehicle);
  } catch (err) {
    next(new ErrorResponse("Server error", 500));
  }
};

// Delete a vehicle (Admin)
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }
    res.status(200).json({ msg: "Vehicle removed" });
  } catch (err) {
    next(new ErrorResponse("Server error", 500));
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
