import express from "express";
import cors from "cors";
import "dotenv/config";
import compression from "compression";

import connectDB from "./config/db.js";
import productRouter from "./routes/product.js";

// Initialize app
const app = express();
const port = process.env.PORT || 4000;

// Connect to database
connectDB();

// Middleware
app.use(compression());
app.use(express.json());

// CORS config
const allowedOrigins = [
  "http://localhost:3000",
  "https://sadaat-pansaar-store-server.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/v1/product", productRouter);

// Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
