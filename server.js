const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const errorHandler = require("./middleware/errorHandler");
const fileUpload = require("express-fileupload");
const webhookEndpoint = require("./routes/webhookEndpoint");
const { notFound } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const { config } = require("dotenv");
config();
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(fileUpload());
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1", webhookEndpoint);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
