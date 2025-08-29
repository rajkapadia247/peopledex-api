require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const auth = require("./middleware/auth");

const app = express();
const PORT = 8080;

const cors = require("cors");

const corsOptions = {
  origin: [
    "https://peopledex.space",
    "https://www.peopledex.space",
    "http://localhost:5173",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
  });
});

app.use("/api/auth", require("./routes/auth"));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error →", err));

app.use("/api/contacts", auth, require("./routes/contacts"));
