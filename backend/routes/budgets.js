const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Budget = require("../models/Budget");

// Middleware to verify JWT token
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Missing token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}

// GET /api/budgets — fetch all user's budgets
router.get("/", authenticate, async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id }).sort({
      date: -1,
    });
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/budgets — create a new budget
router.post("/", authenticate, async (req, res) => {
  try {
    const { category, amount, type, date, description } = req.body;

    if (!category || !amount || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tx = new Budget({
      userId: req.user.id,
      category,
      amount,
      type,
      date: date || new Date(),
      description,
    });

    await tx.save();
    res.status(201).json(tx);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/budgets/:id — update budget
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Budget.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Budget not found" });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/budgets/:id — delete budget
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Budget.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ error: "Budget not found" });
    res.json({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
