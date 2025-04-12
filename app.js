const express = require("express");
const app = express();
const router = require("./routes/blog.route");
require("dotenv").config();

const port = process.env.PORT || 3000;

//middlewares
app.use(express.json());
app.use(router);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is health is okay" });
});

app.listen(port, () => {
  console.log(`Server is listening on port : ${port}`);
});
