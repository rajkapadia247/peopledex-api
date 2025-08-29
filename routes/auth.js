const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/hash");
const { makeToken, verifyToken } = require("../utils/jwt");

router.post("/google/verify", async (req, res) => {
  try {
    const { access_token, nonce } = req.body;
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    const userInfo = await userInfoResponse.json();
    let user = await User.findOne({ email: userInfo.email });
    if (!user) {
      console.log("Creating user");
      user = await User.create({
        name: userInfo.name,
        email: userInfo.email?.toLowerCase(),
        picture: userInfo.picture,
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
router.post("/register", async (req, res) => {
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
router.post("/login", async (req, res) => {
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

router.get("/me", async (req, res) => {
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
