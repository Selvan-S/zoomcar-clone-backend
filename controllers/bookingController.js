const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const ErrorResponse = require("../utils/errorResponse");

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: "vehicle user",
        select: "-password",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 });

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

    res.status(201).json(booking);
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

const updateBooking = async (req, res, next) => {
  const { status, BookingId, vehicleId } = req.body;
  if (status == "cancelled" || status == "completed") {
    try {
      // Find the vehicle
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return next(new ErrorResponse("Vehicle not available", 400));
      }

      // Find the booking and update the status
      const booking = await Booking.findByIdAndUpdate(BookingId, {
        $set: { status },
      });

      res.status(201).json(booking);
    } catch (error) {
      next(new ErrorResponse("Server error", 500));
    }
  }
};

module.exports = { getBookings, createBooking, updateBooking };
