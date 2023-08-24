const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const adminLayout = "../views/layouts/admin";
const jwtSecret = process.env.JWT_SECRET;

/*
 * Middleware
 * Auth - Checks user token and verifies user is authorized
 */

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/*
 * Get
 * Admin - Render access
 */
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple blog with Nodejs, Express and Mongodn",
    };

    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/*
 * Get
 * Admin - Login
 */

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials." });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid Credentials." });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/*
 * Get
 * Admin - Register new user
 */

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      if (error.code === 11000) {
        res.status(400).json({ message: "Username already in use." });
      }
      res.status(500).json({ message: "Internal server error." });
    }
  } catch (error) {
    console.log(error);
  }
});
/*
 * Get
 * Admin - dashboard
 */

router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple blog with Nodejs, Express and Mongodn",
    };
    const data = await Post.find();
    res.render("admin/dashboard", { locals, data, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
})

/*
 * Get
 * Admin - Create new post
 */

router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple blog with Nodejs, Express and Mongodn",
    };
    const data = await Post.find();
    res.render("admin/add-post", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/*
 * Post
 * Admin - Create new post
 */

router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body,
      });

      await Post.create(newPost);
      res.redirect("/dashboard");
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
});

/*
 * Get
 * Admin - View post
 */
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple blog with Nodejs, Express and MongoDB",
    };
    const data = await Post.findOne({ _id: req.params.id });

    res.render("admin/edit-post", { data, locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

/*
 * Post
 * Admin - Edit post
 */
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updated_at: Date.now(),
    });

    res.redirect(`/post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});


/*
 * Delete
 * Admin - Delete post
 */

router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});


module.exports = router;