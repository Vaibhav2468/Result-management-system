const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const auth = require("../middleware/auth.middleware");

// Register Admin
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }



    // Create new user WITHOUT manual password hashing
    const newUser = new User({
      username,
      email,
      password, // Store plain text, will be hashed in the pre-save hook
      role: role || "admin",
    });

    const savedUser = await newUser.save();



    // Create token
    const token = jwt.sign(
      { id: savedUser._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Registration successful",
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login Admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Validate input fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required-" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Validate password (compare with hashed password in DB)
    const isMatch = await bcrypt.compare(password, user.password);
 
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1d" }
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err); // Log error for debugging
    res
      .status(500)
      .json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
  }
});

router.post("/tokenIsValid", async (req, res) => {
  try {
    // Extract Bearer Token
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });

    // Verify Token
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    if (!verified)
      return res.status(401).json({ success: false, message: "Invalid token" });

    // Find User
    const user = await User.findById(verified.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    return res.json({ success: true, message: "Token is valid" });
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// Get User Data (Protected Route)
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error fetching user data:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
module.exports = router;
