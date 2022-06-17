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

//__________________MAIN_____________________//
app.get("/", function (req, res) {
  if (loggedIn) {
    res.redirect("index");
  } else {
    res.redirect("/login");
  }
});

//__________________LOGIN_____________________//
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

//__________________INDEX_____________________//
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

//__________________HOME_____________________//

app.post("/home", (req, res) => {
  if (loggedIn) {
    const { id } = req.body;
    connection.query(
      "select D.id,D.p1, D.p2, D.p3, D.p4, D.hum, D.temp, D.amb_hum, D.amb_temp, D.amb_temp from Data D where D.pid = " + connection.escape(id) + " order by D.id desc limit 1",
      (error, result) => {
        if (error) throw error;
        console.log(result[0]);
        const data1 = [
          [-result[0].p1, -result[0].p2],
          [-result[0].p3, -result[0].p4],
        ];
        res.render("home", { data: result[0], data1:data1, id: id });
      }
    );
  } else {
    res.redirect("/login");
  }
});

//__________________HISTORY_____________________//
app.post("/history", (req, res) => {
  if (loggedIn) {
    const { id } = req.body;
    connection.query(
      "select D.id,D.p1, D.p2, D.p3, D.p4, D.hum, D.temp, D.amb_hum, D.amb_temp, D.amb_temp from Data D where D.pid = " + connection.escape(id),
      (error, result) => {
        if (error) throw error;
        let data_pressure = [];
        let data_hum = [];
        let data_amb = [];
        for (let i = 0; i < result.length; i++) {
          data_pressure.push([result[i].id, result[i].p1, result[i].p2, result[i].p3, result[i].p4]);
          data_hum.push([result[i].id, result[i].hum, result[i].temp]);
          data_amb.push([result[i].id, result[i].amb_hum, result[i].amb_temp])
        }
        console.log(result.length);
        res.render("history", { data: result, data_pressure:data_pressure, data_hum:data_hum, data_amb:data_amb, length:result.length });
      }
    );
  } else {
    res.redirect("/login");
  }
});

//__________________PORT BIND_____________________//
app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
