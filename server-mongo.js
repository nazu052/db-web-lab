const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const Student = mongoose.model(
  "Student",
  new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 16 },
    city: String,
    course: String
  })
);

app.get("/api/students", async (req, res) => {
  try {
    res.json(await Student.find().sort({ _id: 1 }).lean());
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Серверийн алдаа"
    });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    res.status(201).json(await Student.create(req.body));
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log("MongoDB-тэй холбогдлоо");
    app.listen(3000, () => {
      console.log("http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("Холбогдож чадсангүй:", err.message);
  });