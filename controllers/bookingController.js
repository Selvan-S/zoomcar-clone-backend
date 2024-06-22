const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("vehicle user")
      .select("-password");
    res.status(200).json({ userBookings: bookings });
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

const createBooking = async (req, res) => {
  const { vehicleId, userId, startDate, endDate, totalPrice } = req.body;

  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle || !vehicle.availability) {
      return next(new ErrorResponse("Vehicle not available", 400));
    }

    const booking = new Booking({
      vehicle: vehicleId,
      user: userId,
      startDate,
      endDate,
      totalPrice,
    });

    await booking.save();

    // Update vehicle availability
    vehicle.availability = false;
    await vehicle.save();

    res.status(201).json(booking);
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

module.exports = { getBookings, createBooking };
