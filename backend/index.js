require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const budgetsRoutes = require('./routes/budgets');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "https://personal-budget-tracker-phi.vercel.app/",
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/api/budgets', budgetsRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongo connected");
    app.listen(PORT, () => console.log("Server listening on", PORT));
  })
  .catch((err) => {
    console.error("Mongo connection error", err);
    process.exit(1);
  });
