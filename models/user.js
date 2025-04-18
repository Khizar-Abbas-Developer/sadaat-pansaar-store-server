import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String }, // Optional
    email: {
      type: String,
      required: true, // Only email is required
      unique: true,
      match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Email validation regex
    },
    impression: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String, // Optional
      default: null, // Default value is null
    },
    phone: {
      type: String, // Optional
      default: null, // Default value is null
    },
    isVerified: {
      type: Boolean, // Optional
      default: false, // Default value is false
    },
    method: {
      type: String, // Optional
      required: true,
      enum: ["custom", "gmail"],
      default: "custom", // Default value is "custom"
    },
    image: {
      type: String, // Optional
      default: null, // Default value is null
    },
    cnic: {
      type: String, // Optional
      default: null, // Default value is null
    },
    pin: {
      type: String, // Optional
      default: null, // Default value is null
    },
    fbrPassword: {
      type: String, // Optional
      default: null, // Default value is null
    }
  },
  { timestamps: true }
);

// Use existing model or create a new one
const userModel = models.user || model("user", userSchema);

export default userModel;
