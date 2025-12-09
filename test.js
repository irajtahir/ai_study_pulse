const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    process.exit(0); // exit after success
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
