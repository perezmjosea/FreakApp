const express = require("express");
const router = express.Router();
const axios = require("axios");

const apiURL = "https://api.themoviedb.org/3/";

// const movies = axios
//   .get(apiURL + "discover/movie", {
//     params: {
//       api_key: process.env.TMDB_API_KEY
//     }
//   })
//   .catch(e => res.status(500).send("error"));

router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/home", function(req, res, next) {
  res.render("home", { title: "Freak App" });
});

router.get("/movies", function(req, res, next) {
  res.render("movies", { title: "Freak App | Movies" });
});

module.exports = router;
