require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/jlearn";
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
};

module.exports = connectDB;
