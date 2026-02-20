require("dotenv").config();
require("./utils/alertScheduler"); // ✅ MUST BE AT TOP

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const subscriptionRoutes = require("./routes/subscriptionRoutes");
const alertRoutes = require("./routes/alertRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");


const app = express();

// Connect MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// Routes
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));




app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
