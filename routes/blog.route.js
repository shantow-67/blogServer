const express = require("express");
const router = express.Router();
const Joi = require("joi");
const BlogPost = require("../model/blog.model");
const fs = require("fs").promises;
const path = require("path");
const striptags = require("striptags");

const blogSchema = Joi.object({
  title: Joi.string().min(3).required(),
  content: Joi.string().min(10).required(),
  author: Joi.string().required(),
});

//creat new blog post
router.post("/post", async (req, res) => {
  const { error } = blogSchema.validate(req.body);
  // if validation failed ,send an error response
  if (error) {
    return res
      .status(400)
      .json({ message: "data validation failed", error: error.details });
  }

  // Sanitize input
  const title = striptags(req.body.title);
  const content = striptags(req.body.content);
  const author = striptags(req.body.author);

  // create a new BlogPost instance
  const blog = new BlogPost(title, content, author);

  try {
    //First read the stored data
    const data = await fs.readFile(
      path.join(__dirname, "..", "db.json"),
      "utf-8"
    );
    const blogs = JSON.parse(data);

    //creating new id for new blog
    blog.id = blogs.length + 1;
    blogs.push(blog);

    //rewrite stored data with new blog pushed in
    await fs.writeFile(
      path.join(__dirname, "..", "db.json"),
      JSON.stringify(blogs, null, 2)
    );
    res.status(201).json({ message: "Blog post created successfully", blog });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Blog post create failed", error: error.message });
  }
});

//get post by id
router.get("/post/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    //First read the stored data
    const data = await fs.readFile(
      path.join(__dirname, "..", "db.json"),
      "utf-8"
    );
    const blogs = JSON.parse(data);

    //find the post with id
    const blogPost = blogs.find((blog) => blog.id === id);

    //if post does not exist response 404 error
    if (!blogPost) {
      return res
        .status(404)
        .json({ mesage: `Post does not exist with id ${id}` });
    }

    res.status(200).json({ message: "get post success", blogPost });
  } catch (error) {
    res.status(400).json({ message: "get post failed", error: error.message });
  }
});

module.exports = router;
