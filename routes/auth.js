const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { OAuth2Client } = require("google-auth-library");
const { hashPassword, comparePassword } = require("../utils/hash");
const { makeToken, verifyToken } = require("../utils/jwt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/auth/google/verify", async (req, res) => {
  try {
    const { idToken, nonce } = req.body;
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log(payload);
    if (!payload || !payload.email || !payload.email_verified) {
      return res.status(401).json({ error: "Invalid Google token" });
    }
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      console.log("Creating user");
      user = await User.create({
        name: payload.name,
        email: payload.email?.toLowerCase(),
        picture: payload.picture,
      });
      const token = makeToken({ id: user._id });
      res.status(201).json({
        message: "Registered",
        isNewUser: true,
        userData: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            picture: user.picture,
          },
        },
      });
    }
    console.log("User found");
    const token = makeToken({ id: user._id });
    res.json({
      message: "Logged in",
      userData: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          picture: user.picture,
        },
      },
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e.message });
  }
});

// POST /api/register
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email in use" });

    const hashed = await hashPassword(password);
    const user = await User.create({ name, email, password: hashed });
    const token = makeToken({ id: user._id });
    res.status(201).json({
      message: "Registered",
      isNewUser: true,
      userData: { token, user: { _id: user._id, name, email } },
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// POST /api/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = makeToken({ id: user._id });
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: email,
        picture: user.picture,
      },
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.get("/auth/me", async (req, res) => {
  try {
    const decodedToken = verifyToken(req.headers.authorization.split(" ")[1]);
    const user = await User.findOne({ _id: decodedToken.id });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
    });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
