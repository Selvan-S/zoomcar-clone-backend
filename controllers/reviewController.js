const Review = require("../models/Review");
const Vehicle = require("../models/Vehicle");

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("user vehicle");
    res.status(200).json(reviews);
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

const createReview = async (req, res) => {
  const { vehicleId, userId, rating, comment } = req.body;

  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return next(new ErrorResponse("Vehicle not found", 400));
    }

    const review = new Review({
      vehicle: vehicleId,
      user: userId,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    next(new ErrorResponse("Server error", 500));
  }
};

module.exports = { getReviews, createReview };
