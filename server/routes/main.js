const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// Routes
router.get("", async (req, res) => {
  const locals = {
    title: "Nodejs Blog",
    description: "Simple blog with Nodejs, Express and Mongodn",
  };

  try {
    const data = await Post.find();
    res.render("index", { data, locals });
  } catch (error) {
    console.log(error);
  }
});

router.get("", async (req, res) => {
  try {
    const locals = {
      title: "Nodejs Blog",
      description: "Simple blog with Nodejs, Express and Mongodn",
    };
    let perPage = 10;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page)
      .limit(perPage)
      .exec();

    const count = await Post.count();
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage);

    res.render("index", {
      data,
      locals,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/post/:id", async (req, res) => {
  try {
    let slug = req.params.id;

    const data = await Post.findById({
      _id: slug,
    });

    const locals = {
      title: data.title,
      description: "Simple Blog with Nodejs, Express and Mongodb",
    };

    res.render("post", { data, locals });
  } catch (error) {
    console.log(error);
  }
});

router.post("/search", async (req, res) => {
  try {
    const locals = {
      title: "Nodejs Blog",
      description: "Simple blog with Nodejs, Express and Mongodn",
    };

    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const data = await Post.find({
      $or: [
        {
          title: { $regex: new RegExp(searchNoSpecialChar, "i") },
          body: { $regex: new RegExp(searchNoSpecialChar, "i") },
        },
      ],
    });

    // res.send(searchTerm);
    res.render("search", { data, locals });
  } catch (error) {
    console.log(error);
  }
});

router.get("/about", async (req, res) => {
  res.render("about");
});

router.get("/contact", async (req, res) => {
  res.render("contact");
});

module.exports = router;
