import mongoose from "mongoose";
import { config } from "dotenv";
config();

let isListenersAdded = false; // Flag to ensure listeners are added only once

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;
    if (!dbURI) {
      throw new Error("MONGO_URI is not defined in the .env file");
    }

    // Check if the database is already connected
    if (mongoose.connection.readyState === 1) {
      console.log("Database is already connected.");
      return;
    }

    // Add event listeners only once
    if (!isListenersAdded) {
      mongoose.connection.on("connected", () => {
        console.log("Successfully connected to Database");
      });

      mongoose.connection.on("error", (err) => {
        console.error("Database connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("Database disconnected");
      });

      isListenersAdded = true; // Update the flag
    }

    // If the database is not connected or disconnected, attempt to connect
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(dbURI);
    }
  } catch (error) {
    console.error("Failed to connect to the database", error.message);
    process.exit(1);
  }
};

export default connectDB;
