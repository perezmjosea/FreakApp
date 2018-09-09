const express = require("express");
const router = express.Router();
const axios = require("axios");

const apiURL = "https://api.themoviedb.org/3";

router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

// HOME
router.get("/home", async function(req, res, next) {
  // const seessionID = await axios.get(apiURL + "/authentication/token/new", {
  //   api_key: process.env.TMDB_API_KEY
  // });
  res.render("home", { title: "Freak App" });
});

// MOVIES
router.get("/movies", async function(req, res) {
  const genre = req.query.genreId; // FILTRAR POR GENERO
  // let movieList;

  const movies = await axios
    .get(apiURL + "/discover/movie", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  const movieGenres = await axios
    .get(apiURL + "/genre/movie/list", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  // if (genre) {
  //   movieList = movies.data.results.filter(
  //     item => item.genre_ids.indexOf(parseInt(genre)) > -1
  //   );
  // } else {
  //   movieList = movies.data.results;
  // }

  res.render("movies", {
    title: "Freak App | Movies",
    page: "movies",
    movies: movies.data.results,
    genres: movieGenres.data.genres,
    genreActive: parseInt(genre)
  });
});

router.get("/movies/genre/:id", async function(req, res) {
  const genre = req.params.id; // FILTRAR POR GENERO
  let movieList;

  const movies = await axios
    .get(apiURL + "/discover/movie", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  const movieGenres = await axios
    .get(apiURL + "/genre/movie/list", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  if (genre) {
    movieList = movies.data.results.filter(
      item => item.genre_ids.indexOf(parseInt(genre)) > -1
    );
  } else {
    movieList = movies.data.results;
  }

  res.render("movies", {
    title: "Freak App | Movies",
    page: "movies",
    movies: movieList,
    genres: movieGenres.data.genres,
    genreActive: parseInt(genre)
  });
});

// TV SERIES
router.get("/series", async function(req, res) {
  const series = await axios
    .get(apiURL + "/discover/tv", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  const serieGenres = await axios
    .get(apiURL + "/genre/tv/list", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  res.render("series", {
    title: "Freak App | Series",
    page: "series",
    series: series.data.results,
    genres: serieGenres.data.genres
  });
});

module.exports = router;

// MOVIES
// {
//   vote_count: 7065,
//   id: 299536,
//   video: false,
//   vote_average: 8.3,
//   title: 'Avengers: Infinity War',
//   popularity: 275.362,
//   poster_path: '/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg',
//   original_language: 'en',
//   original_title: 'Avengers: Infinity War',
//   genre_ids: [ 12, 878, 14, 28 ],
//   backdrop_path: '/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg',
//   adult: false,
//   overview: 'As the Avengers and their allies have continued to protect the world from threats too large for any one hero to handle, a new danger has emerged from the cosmic shadows: Thanos. A despot of intergalactic infamy, his goal is to collect all six Infinity Stones, artifacts of unimaginable power, and use them to inflict his twisted will on all of reality. Everything the Avengers have fought for has led up to this moment - the fate of Earth and existence itself has never been more uncertain.',
//   release_date: '2018-04-25'
// }

// MOVIE GENRE
// {
//   id: 28, name: 'Action'
// }

// TV SERIES
// {
//   original_name: 'The Big Bang Theory',
//   genre_ids: [ 35 ],
//   name: 'The Big Bang Theory',
//   popularity: 320.685,
//   origin_country: [ 'US' ],
//   vote_count: 3149,
//   first_air_date: '2007-09-24',
//   backdrop_path: '/nGsNruW3W27V6r4gkyc3iiEGsKR.jpg',
//   original_language: 'en',
//   id: 1418,
//   vote_average: 6.8,
//   overview: 'The Big Bang Theory is centered on five characters living in Pasadena, California: roommates Leonard Hofstadter and Sheldon
// Cooper; Penny, a waitress and aspiring actress who lives across the hall; and Leonard and Sheldon\'s equally geeky and socially awkward friends and co-workers, mechanical engineer Howard Wolowitz and astrophysicist Raj Koothrappali. The geekiness and intellect of the four guys is contrasted for comic effect with Penny\'s social skills and common sense.',
//   poster_path: '/ooBGRQBdbGzBxAVfExiO8r7kloA.jpg'
// }
