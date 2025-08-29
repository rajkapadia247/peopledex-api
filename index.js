require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const auth = require("./middleware/auth");

const app = express();
const PORT = 8080;

const cors = require("cors");
app.use(cors());

app.use(express.json());
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
