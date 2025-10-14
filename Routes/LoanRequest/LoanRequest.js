const express = require("express");
const router = express.Router();
const { client } = require("../../config/db");
const { ObjectId } = require("mongodb");

// Connect to LoanRequest collection
const LoanRequestCollection = client
  .db("naziur_rahman")
  .collection("LoanRequest");

// Get all loan requests
router.get("/", async (req, res) => {
  try {
    const loanRequests = await LoanRequestCollection.find({}).toArray();
    res.status(200).json(loanRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get loan requests by phone number
router.get("/Phone/:phone", async (req, res) => {
  try {
    const { phone } = req.params; // get phone from route parameter

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    const loanRequests = await LoanRequestCollection.find({ phone }).toArray();
    res.status(200).json(loanRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a loan request by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const loanRequest = await LoanRequestCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!loanRequest)
      return res.status(404).json({ message: "Loan request not found" });

    res.status(200).json(loanRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new loan request
router.post("/", async (req, res) => {
  try {
    const loanRequest = req.body;

    if (
      !loanRequest.phone ||
      !loanRequest.loan_type ||
      !loanRequest.loan_amount
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const result = await LoanRequestCollection.insertOne(loanRequest);
    res
      .status(201)
      .json({ message: "Loan request created", id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update loan request status
router.put("/Status/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const result = await LoanRequestCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Loan request not found or status unchanged" });
    }

    res.status(200).json({ message: "Status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a loan request by ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const result = await LoanRequestCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "Loan request not found" });

    res.status(200).json({ message: "Loan request updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a loan request by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await LoanRequestCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Loan request not found" });

    res.status(200).json({ message: "Loan request deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
