require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mysql = require("mysql");

var loggedIn = false;

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

//__________________DATABASE CONNECTION_____________________//
// let connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_USERNAME,
// });

// connection.connect((err) => {
//   if (err) {
//     return console.error("error: " + err.message);
//   }
//   console.log("Connected to the MySQL server.");
// });

if (process.env.ENV == "LOCALHOST"){
var db_config = {
  host: process.env.DB_HOST1,
  user: process.env.DB_USERNAME1,
  database: process.env.DB_DATABASENAME1,
};}
else {
  var db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_USERNAME,
  };
}

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();


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
      "select D.id,D.p1, D.p2, D.p3, D.p4, D.hum, D.temp, D.amb_hum, D.amb_temp, D.amb_temp, D.risk from Data D where D.pid = " + connection.escape(id) + " order by D.id desc limit 1",
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

//__________________INSERT_____________________//
app.post("/insert",(req,res)=>{
  console.log("PID",req.query);
  const {pid, p1, p2, p3, p4, hum, temp, amb_hum, amb_temp} = req.query;
  console.log(pid);
  var risk = 0;
  if(p1 >= 800 || p2 >= 800 || p3 >= 800 || p4 >= 800)
    risk = 1;
  
  connection.query(
    "insert into data (pid, p1, p2, p3, p4, hum, temp, amb_hum, amb_temp, risk) values (?)",
    [[pid, p1, p2, p3, p4, hum, temp, amb_hum, amb_temp, risk]],
    (error) => {
      if (error) {
        res.status(303).json(error);
      } else {
        res.status(200).json("Successfully Inserted");
      }
    }
  );
});

//__________________PATIENT_____________________//
app.get("/patient", (req,res)=>{
  if (loggedIn) {
    res.render("patient");
  }else{
    res.redirect("/login");
  }
})

app.get("/patientInfo", (req,res)=>{
  if (loggedIn) {
    const id = 1;
    connection.query(
      "select P.name, P.age, P.gender, P.height, P.weight, P.bedAllocated, P.conditions, P.comments from Patient P where P.pid = " + connection.escape(id),
      (error, result) => {
        if (error) throw error;
        else {
          console.log(result);
          res.render("patientInfo", {data:result[0]});
        }
      }
    );
  }else{
    res.redirect("/login");
  }
})

app.post("/patient", (req,res)=>{
  const { name, age, gender, height, weight, bedAllocated, condition, comments} = req.body;
  connection.query(
    "insert into patient (name, age, gender, height, weight, bedAllocated, conditions, comments) values (?)",
    [[name, age, gender, height, weight, bedAllocated, condition, comments]],
    (error) => {
      if (error) {
        res.send(error);
      } else {
        res.send("Successfully Inserted");
      }
    }
  );
})

//__________________LOGOUT_____________________//
app.post("/logout", (req,res)=>{
  loggedIn = false;
  res.redirect("/login");
});

//__________________PORT BIND_____________________//
app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000.");
});
