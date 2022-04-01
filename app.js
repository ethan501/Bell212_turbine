const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://Bell212:" +
    /* process.env.MONGOOSE_PS */ "sNhHZMWUGJ4DDOHE" +
    "@cluster0.oakkp.mongodb.net/Bell212Power?retryWrites=true&w=majority"
);

const calcSchema = {
  Alt: Number,
  Temp: Number,
  Torque: { type: Number },
  ITT: Number,
  Delta: Number,
};

const Scores = mongoose.model("Scores", calcSchema);
let itt;
let alt = 0;
let deg = 0;
let torque = 0;
let temp = 0;
let maxITT = 0;
app.get("/", function (req, res) {
  itt = 0;
  alt = 0;
  deg = 0;
  torque = 0;
  res.render("index", {
    itt: itt,
    alt: alt,
    deg: deg,
    torque: torque,
  });
});
app.post("/index", function (req, res) {
  let calcAvg = [];
  alt = req.body.alt;
  deg = req.body.deg;
  torque = req.body.torque;
  temp = req.body.deg;

  let torque1 = Number(torque) + 0.3;
  let torque2 = Number(torque) - 0.3;
  torque1.toString();
  torque2.toString();

  let temp1 = Number(deg) + 10;
  let temp2 = Number(deg) - 10;
  temp1.toString();
  temp2.toString();

  let alt1 = Number(alt) + 500;
  let alt2 = Number(alt) - 500;
  temp1.toString();
  temp2.toString();

  Scores.find(
    {
      Temp: { $gt: temp2, $lt: temp1 },
      Alt: { $gt: alt2, $lt: alt1 },
      Torque: { $gt: torque2, $lt: torque1 },
    },
    function (err, calcs) {
      if (typeof calcs[0] != "undefined") {
        
        console.log(
          "*************START OF ALGORITHM**************\nCalcs Grab \n" + calcs
        );

        /* let delta = [];
          calcs.forEach(function (calc) {
            delta.push(calc.Delta);
          });
          console.log(delta); */

        let last = calcs.length - 1;
        last = calcs[last];
        let first = calcs[0];
        console.log("First and last grab for calcs \n" + last, first);

        let delta;
        if (first.Alt === last.Alt) {
          delta = first.Delta;
        } else {
          delta =
            first.Delta +
            ((alt - first.Alt) / (last.Alt - first.Alt)) *
              (last.Delta - first.Delta);
        }
        delta = Math.round(delta * 10) / 10;
        console.log("The delta\n" + delta);
        delta = Number(delta);
        Scores.find(
          {
            Delta: delta,
            Temp: { $gt: temp2, $lt: temp1 },
            Alt: { $gt: alt2, $lt: alt1 },
          },
          function (err, partTwo) {
            if (!err) {
              console.log("the part two grab\n" + partTwo);
              let last = partTwo.length - 1;
              last = partTwo[last];
              let first = partTwo[0];
              console.log("first and last of part two grab \n" + last, first);
              if (first.ITT === last.ITT) {
                itt = first.ITT;
              } else {
                itt =
                  first.ITT +
                  ((temp - first.Temp) / (last.Temp - first.Temp)) *
                    (last.ITT - first.ITT);
                delta = Math.round(delta * 10) / 10;
              }
              console.log(
                "final itt \n" +
                  itt +
                  "\n*********************END OF ALGORITHM*******************"
              );
              res.render("index", {
                itt: itt,
                alt: alt,
                deg: deg,
                torque: torque,
              });
            } else {
              console.log(err);
            }
          }
        );

        /* res.redirect("index"); */
      } else {
        console.log(err + "values inputted falls outside the itt chart");
        itt = "";
        res.render("index", {
          itt: itt,
          alt: alt,
          deg: deg,
          torque: torque,
        });
      }
    }
  );
});

app.get("/index", function (req, res) {
  itt = 0;
  alt = 0;
  deg = 0;
  torque = 0;
  res.render("index", { itt: itt, alt: alt, deg: deg, torque: torque });
});

/* app.get("/index", function (req, res) {
  res.render
}); */

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
