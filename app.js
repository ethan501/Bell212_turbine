const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/BellPowerCheckFinalCVS");

const calcSchema = {
  Alt: Number,
  Temp: Number,
  Torque: { type: Number },
  ITT: Number,
  Delta: Number,
};

const Scores = mongoose.model("Scores", calcSchema);

app.get("/", function (req, res) {
  res.render("index");
});
let alt = 0;
let deg = 0;
let torque = 0;
let maxITT = 0;
let averageMaxITT = 0;

app.post("/index", function (req, res) {
  let calcAvg = [];
  alt = req.body.alt;
  deg = req.body.deg;
  torque = req.body.torque;

  let torque1 = Number(torque) + 0.3;
  let torque2 = Number(torque) - 0.3;
  torque1.toString();
  torque2.toString();

  let temp1 = Number(deg) + 10;
  let temp2 = Number(deg) - 10; 
  temp1.toString(); 
  temp2.toString();

  let alt1 = Number(alt) + 1000;
  let alt2 = Number(alt) - 1000; 
  temp1.toString();
  temp2.toString();

  Scores.find(
    {
      Temp: { $gt: temp2, $lt: temp1 },
      Alt: { $gt: alt2, $lt: alt1 },
      Torque: { $gt: torque2, $lt: torque1 },
    },
    function (err, calcs) {
      if (!err) {
        console.log(calcs);
        calcs.forEach(function (calc) {
          const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
          maxITT = calc.ITT;
          calcAvg.push(maxITT);
          console.log(maxITT);

          averageMaxITT = average(calcAvg).toFixed(0);

          if (averageMaxITT == "NaN") {
            averageMaxITT = "Sorry no Max ITT matches those values";
          }
        });

        res.render("result", {
          calcs: calcs,
          maxITT: maxITT,
          averageMaxITT: averageMaxITT,
          alt: alt,
          deg: deg,
          torque: torque,
        });
      } else {
        console.log(err);
      }
    }
  );
});

/* app.get("/index", function (req, res) {
  res.render
}); */

app.listen(3000, function () {
  console.log("server is running on port 3000");
});
