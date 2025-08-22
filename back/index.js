const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const chatRoute = require("./routes/chatRoute");
const reportRoute = require("./routes/reportRoute");
const { connectDB } = require("./database/mongodb");

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());

// Middleware to parse form data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Load routes
app.use("/api/v1", chatRoute);
app.use("/api/v1", reportRoute);

// Top-level error handling for unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

// Optionally catch uncaught exceptions too
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Start the server
const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await connectDB(); // Wait for DB connection before starting server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to the database:", error);
    process.exit(1);
  }
})();
