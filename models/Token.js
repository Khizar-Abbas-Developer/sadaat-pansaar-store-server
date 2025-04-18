import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true, // Ensure token is unique
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

const TokenModel = mongoose.model("Token", tokenSchema);
export default TokenModel;
