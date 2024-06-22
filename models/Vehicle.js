const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hostCarImage: { type: Array, default: [] },
  carType: {
    type: String,
    enum: ["Hatchback", "Sedan", "SUV", "Luxury"],
    required: true,
  },
  fuelType: {
    type: String,
    enum: ["Petrol", "Diesel", "Electric"],
    required: true,
  },
  transmission: { type: String, enum: ["Manual", "Automatic"], required: true },
  seats: { type: String, enum: [5, 7], required: true },
  availability: { type: Boolean, default: true },
  pricePerHour: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Vehicle", VehicleSchema);
