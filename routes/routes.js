// MODULES
const express = require("express");
const router = express.Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// DATA BASES
const dbMoviesPath = path.join(__dirname, "../data/dbmovies.json");
const dbSeriesPath = path.join(__dirname, "../data/dbseries.json");
const dbMovies = JSON.parse(fs.readFileSync(dbMoviesPath), "utf8");
const dbSeries = JSON.parse(fs.readFileSync(dbSeriesPath), "utf8");

// API
const apiURL = "https://api.themoviedb.org/3";
const config = {
  params: {
    api_key: process.env.TMDB_API_KEY
  }
};

// FUNCTIONS
//// Save on DB
function saveOnDB(data, type) {
  if (type == "movies") {
    const currentMovies = dbMovies.movies;
    const newMovies = [...currentMovies, ...data];
    const moviesToWrite = { movies: newMovies };
    const moviesToString = JSON.stringify(moviesToWrite);
    fs.writeFileSync(dbMoviesPath, moviesToString, "utf8");
  }
  if (type == "series") {
    const currentSeries = dbSeries.series;
    const newSeries = [...currentSeries, ...data];
    const seriesToWrite = { series: newSeries };
    const seriesToString = JSON.stringify(seriesToWrite);
    fs.writeFileSync(dbSeriesPath, seriesToString, "utf8");
  }
}

// INDEX VIEW
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

// HOME VIEW
router.get("/home", async function(req, res, next) {
  const movies = await axios
    .get(apiURL + "/discover/movie", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  const formatedMovies = movies.data.results.map(movie => ({
    ...movie,
    rating: 0,
    isFav: false,
    onLibrary: false
  }));
  const reqMovies = formatedMovies.filter(movie => {
    const isDuplicated = dbMovies.movies.find(item => item.id === movie.id);
    return !Boolean(isDuplicated);
  });
  saveOnDB(reqMovies, "movies");
  res.render("home", { title: "Freak App" });
});

// MOVIES VIEW
router.get("/movies", async function(req, res) {
  const genreFilter =
    req.query.genre && req.query.genre !== undefined
      ? req.query.genre
      : undefined;

  const searchFilter =
    req.query.search && req.query.search !== undefined
      ? req.query.search
      : undefined;

  const isAjaxRequest =
    req.query.ajaxReq && req.query.ajaxReq !== false
      ? req.query.ajaxReq
      : false;

  const searchempty =
    req.query.searchempty && req.query.searchempty !== false
      ? req.query.searchempty
      : false;

  const movies = await axios
    .get(apiURL + "/discover/movie", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  const genres = await axios
    .get(apiURL + "/genre/movie/list", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  if (isAjaxRequest) {
    if (genreFilter) {
      // Get data from DB
      // if (genreFilter == "all") {
      //   const movies = dbMovies.movies;
      //   return res.status(200).json({ movies: movies });
      // } else {
      //   const movies = dbMovies.movies.filter(
      //     movie => movie.genre_ids.indexOf(parseInt(genreFilter)) >= 0
      //   );
      //   return res.status(200).json({ movies: movies });
      // }

      // Get data from API
      let filteredMovies;
      if (genreFilter == "all") {
        filteredMovies = movies.data.results;
      } else {
        filteredMovies = movies.data.results.filter(
          movie => movie.genre_ids.indexOf(parseInt(genreFilter)) >= 0
        );
      }
      const formatedMovies = filteredMovies.map(movie => ({
        ...movie,
        rating: 0,
        isFav: false,
        onLibrary: false
      }));
      const reqMovies = formatedMovies.filter(movie => {
        const isDuplicated = dbMovies.movies.find(item => item.id === movie.id);
        return !Boolean(isDuplicated);
      });
      saveOnDB(reqMovies, "movies");
      return res.status(200).json({ movies: formatedMovies });
    }

    if (searchFilter) {
      // Get data from DB
      // const movies = dbMovies.movies.filter(
      //   movie =>
      //     movie.title.toLowerCase().indexOf(searchFilter.toLowerCase()) >= 0
      // );
      // return res.status(200).json({ movies: movies });

      // Get data from API
      const movies = await axios
        .get(apiURL + "/search/movie", {
          params: {
            api_key: process.env.TMDB_API_KEY,
            language: "es-ES",
            region: "ES",
            query: searchFilter
          }
        })
        .catch(e => res.status(500).send("error"));

      const formatedMovies = movies.data.results.map(movie => ({
        ...movie,
        rating: 0,
        isFav: false,
        onLibrary: false
      }));
      const reqMovies = formatedMovies.filter(movie => {
        const isDuplicated = dbMovies.movies.find(item => item.id === movie.id);
        return !Boolean(isDuplicated);
      });
      saveOnDB(reqMovies, "movies");
      return res.status(200).json({ movies: formatedMovies });
    }
    if (searchempty) {
      const movies = await axios
        .get(apiURL + "/discover/movie", {
          params: {
            api_key: process.env.TMDB_API_KEY,
            language: "es-ES",
            region: "ES"
          }
        })
        .catch(e => res.status(500).send("error"));

      const formatedMovies = movies.data.results.map(movie => ({
        ...movie,
        rating: 0,
        isFav: false,
        onLibrary: false
      }));
      const reqMovies = formatedMovies.filter(movie => {
        const isDuplicated = dbMovies.movies.find(item => item.id === movie.id);
        return !Boolean(isDuplicated);
      });
      saveOnDB(reqMovies, "movies");
      return res.status(200).json({ movies: formatedMovies });
    }
  } else {
    const movies = dbMovies.movies;
    res.render("movies", {
      title: "Freak App | Movies",
      page: "movies",
      movies: movies,
      genres: genres.data.genres
    });
  }
});

// MOVIE DETAILS
router.get("/movie/:id", async function(req, res) {
  const movieId = req.params.id;

  // const movie = await axios
  //   .get(apiURL + "/movie/" + movieId, {
  //     params: {
  //       api_key: process.env.TMDB_API_KEY,
  //       language: "es-ES",
  //       region: "ES"
  //     }
  //   })
  //   .catch(e => res.status(500).send("error"));

  const movie = dbMovies.movies.find(
    item => item.id === parseInt(req.params.id)
  );

  const genres = await axios
    .get(apiURL + "/genre/movie/list", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  let movieGenres = [];
  const movieGenresIds = movie.genre_ids;
  for (i = 0; i < movieGenresIds.length; i++) {
    let gn = genres.data.genres.filter(g => g.id == movieGenresIds[i]);
    movieGenres = [...movieGenres, ...gn];
  }
  console.log(movieGenres);

  res.render("movie-details", {
    title: "Freak App | Movie Details",
    page: "movie-details",
    movie: movie,
    movieGenres: movieGenres
  });
});

// TOGGLE FAV MOVIE
router.patch("/toggle-fav/:id", async function(req, res) {
  const movie = dbMovies.movies.find(
    item => item.id === parseInt(req.params.id)
  );
  movie.isFav = !Boolean(movie.isFav);
  fs.writeFileSync(dbMoviesPath, JSON.stringify(dbMovies), "utf8");

  return res.status(200).send();
});

// TOGGLE LIBRARY MOVIE
router.patch("/toggle-library/:id", async function(req, res) {
  const movie = dbMovies.movies.find(
    item => item.id === parseInt(req.params.id)
  );
  movie.onLibrary = !Boolean(movie.onLibrary);
  fs.writeFileSync(dbMoviesPath, JSON.stringify(dbMovies), "utf8");

  return res.status(200).send();
});

// SERIES VIEW
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

  const genres = await axios
    .get(apiURL + "/genre/tv/list", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  const formatedSeries = series.data.results.map(serie => ({
    ...serie,
    rating: 0,
    isFav: false,
    onLibrary: false
  }));

  const uniqueSeries = formatedSeries.filter(serie => {
    const isDuplicated = dbSeries.series.find(item => item.id === serie.id);
    return !Boolean(isDuplicated);
  });

  res.render("series", {
    title: "Freak App | Series",
    page: "series",
    series: formatedSeries,
    genres: genres.data.genres
  });
  saveOnDB(uniqueSeries, "series");
});

module.exports = router;
