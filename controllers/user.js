import userModel from "../models/user.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import TokenModel from "../models/Token.js";
import crypto from "crypto";

dotenv.config(); // Load environment variables

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, method, phone } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex"); // Generate verification token

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      method,
      phone,
      isVerified: false, // Default to false
    });

    await user.save();

    // Store token in the database
    await TokenModel.create({
      userId: user._id,
      token: verificationToken,
      expiresAt: Date.now() + 3600000, // 1-hour expiry
    });

    // Send verification email
    const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify Your Email",
      html: `
    <div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; text-align: center; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p style="font-size: 16px; color: #555;">Thank you for registering! Click the button below to verify your email:</p>
      <a href="${verificationLink}" 
         style="display: inline-block; padding: 12px 24px; margin-top: 10px; font-size: 16px; color: white; background: #4CAF50; text-decoration: none; border-radius: 5px;">
         Verify Email
      </a>
      <p style="font-size: 14px; color: #777; margin-top: 20px;">
        If you did not request this, please ignore this email.
      </p>
      <hr style="margin: 20px 0;">
      <p style="font-size: 12px; color: #999;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
    </div>
  `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const registerUserGmail = async (req, res) => {
  try {
    console.log("ok");

    const { name, email, method, image } = req.body;

    // Check if the user already exists
    let user = await userModel.findOne({ email });

    if (user) {
      // Generate a JWT token
      const payload = { id: user._id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {});

      // Return the existing user details
      return res.status(200).json({
        success: true,
        message: "User already registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          impression: user.impression,
          method: user.method,
          cnic: user.cnic,
          image: user.image,
          token,
        },
      });
    }

    // Create a new user
    user = new userModel({
      name,
      email,
      method,
      image,
    });

    await user.save();

    // Generate a JWT token
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {});

    // Return success response with user details
    return res.status(200).json({
      success: true,
      message: "User registered successfully",
      authUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        method: user.method,
        image: user.image,
        token,
      },
    });
  } catch (error) {
    console.error("Error in registerUserGmail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check if the user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    // Check if the user has a password (for custom login method)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Try logging in with Google.",
      });
    }

    // Validate the provided password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Create JWT payload with user details
    const payload = { id: user._id, email: user.email };

    // Sign JWT token
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {});

    // Return success message with token
    return res.status(200).json({
      success: true,
      message: "User login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        method: user.method,
        cnic: user.cnic,
        token,
      },
      impression: user.impression, // Include impression in response
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

// 🔹 Forgot Password API

// Transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail
    pass: process.env.EMAIL_PASS, // Your Gmail App Password
  },
});

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate Reset Token (valid for 1 hour)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {});

    // Save token in the database
    await TokenModel.create({
      userId: user._id,
      token,
      expiresAt: Date.now() + 3600000, // 1 hour expiry
    });

    // Reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
<!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            text-align: center;
          }
          .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            margin: auto;
          }
          h3 {
            color: #333;
          }
          p {
            color: #555;
          }
          .button {
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            font-size: 16px;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h3>Password Reset Request</h3>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p class="footer">This link will expire in 1 hour.</p>
        </div>
      </body>
    </html>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🔹 Reset Password API

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== "string") {
      return res
        .status(400)
        .json({ message: "New password is required and must be a string" });
    }

    // Find token in the database
    const tokenEntry = await TokenModel.findOne({ token });
    if (!tokenEntry) {
      return res.status(400).json({
        message: "Invalid or expired token. Please request a new one.",
      });
    }

    // Check if the token has expired
    if (Date.now() > tokenEntry.expiresAt) {
      await TokenModel.deleteOne({ token }); // Remove expired token
      return res
        .status(401)
        .json({ message: "Token has expired. Please request a new one." });
    }

    // Find user by ID from token entry
    const user = await userModel.findById(tokenEntry.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
    user.password = hashedPassword;
    await user.save();

    // Invalidate the token after successful password reset
    await TokenModel.deleteOne({ token });

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find token in the database
    const tokenEntry = await TokenModel.findOne({ token });
    if (!tokenEntry) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Find user and update verification status
    const user = await userModel.findById(tokenEntry.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = true;
    await user.save();

    // Delete token after verification
    await TokenModel.deleteOne({ token });

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUserDetails = async (req, res) => {
  try {
    const { phone, cnic } = req.body;
    const userId = req.user.id; // Assuming you're using authentication middleware to attach user info to req

    // Find and update the user
    const user = await userModel.findByIdAndUpdate(
      userId,
      { phone, cnic, impression: true },
      { new: true, runValidators: true } // Return updated user and validate fields
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User details updated successfully.",
      user: {
        phone: user.phone,
        cnic: user.cnic,
        impression: user.impression,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const updatePasswordAndPin = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found.",
      });
    }

    const { oldPassword, newPassword, oldPin, newPin } = req.body;

    // Validate required fields
    if (!oldPassword || !newPassword || !oldPin || !newPin) {
      return res.status(400).json({
        success: false,
        message:
          "All fields (oldPassword, newPassword, oldPin, newPin) are required.",
      });
    }

    // Fetch user from DB
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify old password
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    // Verify old PIN
    const isPinMatch = await bcrypt.compare(oldPin, user.pin);
    if (!isPinMatch) {
      return res.status(400).json({
        success: false,
        message: "Old PIN is incorrect.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Hash new PIN
    const hashedNewPin = await bcrypt.hash(newPin, salt);

    // Update user details
    user.password = hashedNewPassword;
    user.pin = hashedNewPin;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password and PIN updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating password and PIN",
      error: error.message,
    });
  }
};
