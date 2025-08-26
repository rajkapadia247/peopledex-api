require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Contact = require("./models/Contact");
const auth = require("./middleware/auth");
const { getColorByName } = require("./utils");

const app = express();
const PORT = 8080;

const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use("/api", require("./routes/auth"));

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
// TO DO: Move all routes to a separate file
app.get("/contacts", auth, async (req, res) => {
  const { searchTerm = "", filterFavoritesOnly = "false" } = req.query;
  const query = { userId: req.user.id };

  if (searchTerm) {
    const regex = new RegExp(searchTerm, "i");
    query.$or = [
      { name: regex },
      { email: regex },
      { phone: regex },
      { company: regex },
    ];
  }
  if (filterFavoritesOnly === "true") query.favorite = true;

  try {
    const data = await Contact.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ name: 1 })
      .limit(20)
      .lean()
      .select({
        _id: 0,
        id: "$_id",
        name: 1,
        email: 1,
        phone: 1,
        company: 1,
        favorite: 1,
      });
    const processedData = data.map((contact) => {
      contact.color = getColorByName(contact.name);
      return contact;
    });
    res.send({ data: processedData });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

app.delete("/contacts", auth, async (req, res) => {
  const { id } = req.body;
  try {
    const deleted = await Contact.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });
    if (deleted) return res.send({ message: "Deleted" });
    res.status(404).send({ message: "Contact not found" });
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

app.post("/contacts", auth, async (req, res) => {
  try {
    const contact = await Contact.create({ ...req.body, userId: req.user.id });
    res.status(200).send({ message: "Contact added", data: contact });
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

app.patch("/contacts/favorite", auth, async (req, res) => {
  const { id } = req.body;
  try {
    const contact = await Contact.findOne({ _id: id, userId: req.user.id });
    if (!contact) return res.status(404).send({ message: "Not found" });
    contact.favorite = !contact.favorite;
    await contact.save();
    res.send({ message: "Favorite toggled", data: contact });
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

app.put("/contacts", auth, async (req, res) => {
  const { id, ...fields } = req.body;
  try {
    const updated = await Contact.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      fields,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updated) return res.status(404).send({ message: "Not found" });
    res.send({ message: "Updated", data: updated });
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});
