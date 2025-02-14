const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    //  Extract token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({
          success: false,
          message: "No authentication token, access denied",
        });
    }

    //  Verify token
    const verified = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    if (!verified) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Token verification failed, authorization denied",
        });
    }

    // Attach user ID to request object
    req.user = verified.id;
    next();
  } catch (err) {
    console.error("Authentication Error:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

module.exports = auth;
