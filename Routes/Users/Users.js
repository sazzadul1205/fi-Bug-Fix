const express = require("express");
const router = express.Router();
const { client } = require("../../config/db");
const { ObjectId } = require("mongodb");

const bcrypt = require("bcryptjs");

// Connect to the Users collection
const UsersCollection = client.db("naziur_rahman").collection("Users");

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await UsersCollection.find().toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to get users" });
  }
});

// Check if user's basic info exists
router.get("/UserBasicInfoExistCheck/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const user = await UsersCollection.findOne({ phone });

    if (!user) {
      return res
        .status(404)
        .json({ error: "No user found with this phone number" });
    }

    // List of required basic fields
    const requiredFields = [
      "name",
      "fathers_name",
      "mothers_name",
      "nid_number",
      "blood_group",
      "permanent_address",
      "temporary_address",
      "job",
      "nidFront",
      "nidBack",
      "passportPhoto",
      "signature",
    ];

    // Check if all required fields exist and are not empty/null
    const isComplete = requiredFields.every(
      (field) =>
        user[field] !== undefined && user[field] !== null && user[field] !== ""
    );

    res.status(200).json({ basicInfoSubmitted: isComplete });
  } catch (err) {
    console.error("Error checking basic info:", err);
    res.status(500).json({ error: "Failed to check basic info" });
  }
});

// Get a user by phone number
router.get("/Phone/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const user = await UsersCollection.findOne({ phone });

    if (!user) {
      return res
        .status(404)
        .json({ error: "No user found with this phone number" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user by phone:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Get one user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UsersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Error getting user" });
  }
});

// Add a new user
router.post("/", async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // Validate required fields
    if (!name || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, phone, and password are required" });
    }

    // Check if a user with the same phone already exists
    const existingUser = await UsersCollection.findOne({ phone });

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "Phone number already registered" });
    }

    // Insert the new user
    const result = await UsersCollection.insertOne({ name, phone, password });

    res.status(201).json({
      message: "User added successfully",
      id: result.insertedId,
    });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ error: "Error adding user" });
  }
});

// Check phone and password for login
router.post("/Login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password)
      return res
        .status(400)
        .json({ message: "Phone and password are required" });

    const user = await UsersCollection.findOne({ phone });
    if (!user) return res.status(404).json({ message: "No match found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Password doesn't match" });

    res
      .status(200)
      .json({ success: true, message: "Login successful", phone: user.phone });
  } catch (err) {
    res.status(500).json({ error: "Error during login" });
  }
});

// PUT route to update user data by phone number
router.put("/Phone/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const updateData = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    const result = await UsersCollection.updateOne(
      { phone },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User data updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

module.exports = router;
