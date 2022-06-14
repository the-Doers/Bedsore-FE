require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");

var loggedIn = true;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//__________________DATABASE CONNECTION_____________________//
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_USERNAME,
});

connection.connect((err) => {
  if (err) {
    return console.error("error: " + err.message);
  }
  console.log("Connected to the MySQL server.");
});

const data = [
  [-350, -400],
  [-800, -420],
];

app.get("/", function (req, res) {
  if (loggedIn) {
    res.redirect("index");
    // res.render("home", { data: data });
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

app.get("/index", (req, res) => {
  if (loggedIn) {
    connection.query(
      "select P.pid, P.name, P.monitoring, P.risk from Patient P",
      (error, result) => {
        if (error) throw error;
        console.log(result);
        let mcount = 0, rcount = 0;
        let rpatient = [];
        for (let i = 0; i < result.length; i++) {
          if (result[i].monitoring == 1) {
            mcount += 1;
          }
          if (result[i].risk == 1) {
            rcount += 1;
            rpatient.push(result[i].name);
          }
        }
        count = { mcount: mcount, rcount: rcount };
        res.render("index", { data: result, count: count, rpatient: rpatient });
      }
    );
  } else {
      res.redirect("/login");
  }
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
