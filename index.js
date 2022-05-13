require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

var loggedIn = false;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", function (req, res) {
  if (loggedIn) {
    res.render("home");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", function (req, res) {
  if (loggedIn) {
    res.redirect("/");
  }
  res.render("login");
});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const pass = req.body.password;
  if (username === "admin" && pass === "admin") {
    loggedIn = true;
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});

app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
