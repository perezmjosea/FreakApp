var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/home", function(req, res, next) {
  res.render("home", { title: "Freak App" });
});

router.get("/users", function(req, res, next) {
  res.send("respond with a resource");
});

module.exports = router;