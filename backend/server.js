const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const connectDB = require("./config/db"); // Import MongoDB connection

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Import Routes
const authRoutes = require("./routes/auth.routes");
const courseRoutes = require("./routes/course.routes");
const branchRoutes = require("./routes/branch.routes");
const subjectRoutes = require("./routes/subject.routes");
const resultRoutes = require("./routes/result.routes");
const studentRoutes = require("./routes/student.routes");

// Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/students", studentRoutes);

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Result Management System API" });
});

// Port configuration
const PORT = process.env.PORT || 5000;
// Connect to MongoDB first, then start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB. Server not started.", err);
  });
