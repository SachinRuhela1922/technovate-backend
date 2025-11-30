import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Models
import User from "./models/User.js";
import UserDetails from "./models/UserDetails.js";

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = "your_jwt_secret_key"; // Change this in production

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb+srv://iosachinruhela_db_user:technovate@data.2zfq9he.mongodb.net/?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected 🌱"))
  .catch((err) => console.log("MongoDB connection error:", err));

// ----------------------
// Auth Routes
// ----------------------

// Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------
// Middleware for Protected Routes
// ----------------------
const authMiddleware = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ----------------------
// User Input Routes
// ----------------------
app.post("/api/user/input", authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, description, skills } = req.body;
    if (!name || !email) return res.status(400).json({ message: "Name and email required" });

    const userInput = new UserDetails({
      userId: req.userId,
      name,
      email,
      phone,
      description,
      skills,
    });

    await userInput.save();
    res.status(201).json({ message: "User details saved", data: userInput });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/api/auth/test", (req, res) => {
  res.json({ message: "API is working 🚀" });
});


// ----------------------
// Start server
// ----------------------
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
