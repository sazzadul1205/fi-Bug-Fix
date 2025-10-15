const express = require("express");
const router = express.Router();
const { client } = require("../../config/db");
const { ObjectId } = require("mongodb");

// Nominee collection
const NomineeInfoCollection = client
  .db("naziur_rahman")
  .collection("NomineeInfo");

// Get all nominees
router.get("/", async (req, res) => {
  try {
    const nominees = await NomineeInfoCollection.find()
      .sort({ created_at: -1 })
      .toArray();
    res.status(200).json(nominees);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Check if nominee info exists for a user
router.get("/NomineeInfoExistCheck/:phone", async (req, res) => {
  try {
    // Get phone from route parameter
    const { phone } = req.params;

    // Validate phone
    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Find nominee by user phone
    const nominee = await NomineeInfoCollection.findOne({ user_phone: phone });

    // If nominee not found
    if (!nominee) {
      return res.status(200).json({ nomineeInfoSubmitted: false });
    }

    // List of required nominee fields
    const requiredFields = [
      "nominee_name",
      "nominee_phone",
      "relation",
      "nominee_nid",
      "nominee_nid_front",
      "nominee_nid_back",
      "nominee_passport_photo",
    ];

    // Check if all required fields are present and not empty
    const isComplete = requiredFields.every(
      (field) =>
        nominee[field] !== undefined &&
        nominee[field] !== null &&
        nominee[field] !== ""
    );

    // Return response
    res.status(200).json({ nomineeInfoSubmitted: isComplete });
  } catch (err) {
    console.error("Error checking nominee info:", err);
    res.status(500).json({ error: "Failed to check nominee info" });
  }
});

// Get nominee by user_phone
router.get("/Phone/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "User phone number is required" });
    }

    const nominee = await NomineeInfoCollection.findOne({ user_phone: phone });

    if (!nominee) {
      return res
        .status(404)
        .json({ success: false, message: "Nominee not found" });
    }

    res.status(200).json(nominee);
  } catch (error) {
    console.error("Error fetching user by phone:", err);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Get single nominee by ID
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const nominee = await NomineeInfoCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!nominee) return res.status(404).json({ message: "Nominee not found" });

    res.status(200).json(nominee);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add new nominee
router.post("/", async (req, res) => {
  try {
    const data = req.body;

    if (
      !data.nominee_name ||
      !data.nominee_phone ||
      !data.relation ||
      !data.nominee_nid ||
      !data.user_phone
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await NomineeInfoCollection.insertOne({
      ...data,
      created_at: new Date(),
    });

    res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update nominee by user_phone
router.put("/Phone/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const updateData = req.body;

    // Validate phone param
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "User phone number is required" });
    }

    // Update nominee by user_phone
    const result = await NomineeInfoCollection.updateOne(
      { user_phone: phone },
      { $set: { ...updateData, updated_at: new Date() } }
    );

    // Check if any document matched
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Nominee not found" });
    }

    // Success response
    res.status(200).json({
      success: true,
      message: "Nominee data updated successfully",
    });
  } catch (error) {
    console.error("Error updating nominee by phone:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update nominee data",
      error: error.message,
    });
  }
});

// Update nominee by ID
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const result = await NomineeInfoCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updated_at: new Date() } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Nominee not found" });

    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete nominee by ID
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid ID" });

    const result = await NomineeInfoCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Nominee not found" });

    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
