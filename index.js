// index.js
const express = require("express");
const cors = require("cors");

// Connect Database
const { connectDB } = require("./config/db");

const Users = require("./Routes/Users/Users");
const NomineeInfo = require("./Routes/NomineeInfo/NomineeInfo");
const LoanRequest = require("./Routes/LoanRequest/LoanRequest");

require("dotenv").config();
const app = express();

// CORS – add your prod domains here
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.0.11:5173",
      "http://192.168.0.105:5173",
      "http://192.168.0.3:5173",
      "https://sass-micro-finance.web.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Connect to the database
connectDB();

app.use("/Users", Users);

app.use("/NomineeInfo", NomineeInfo);

app.use("/LoanRequest", LoanRequest);

// Root health-check
app.get("/", (req, res) => {
  res.send("Naziur Rahman Server is Running");
});

// Error handlers
process.on("uncaughtException", (err) => {
  console.error("There was an uncaught error", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless
module.exports = app;
