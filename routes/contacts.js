const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

router.get("", async (req, res) => {
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
    res.send({ data });
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

router.delete("", async (req, res) => {
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

router.post("", async (req, res) => {
  try {
    const contact = await Contact.create({ ...req.body, userId: req.user.id });
    res.status(200).send({ message: "Contact added", data: contact });
  } catch (e) {
    res.status(400).send({ message: e.message });
  }
});

router.patch("/favorite", async (req, res) => {
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

router.put("", async (req, res) => {
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
