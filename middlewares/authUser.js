import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    // Extract token from request headers
    const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. Token is missing.",
      });
    }

    // Verify the token using JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please log in again.",
      });
    }

    // Attach user ID and other data to request object
    req.user = {
      id: decoded.id,
      email: decoded.email, // Include email if needed
    };

    // Call the next middleware or route handler
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
      error: error.message,
    });
  }
};

export default authUser;
