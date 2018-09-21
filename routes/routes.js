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
router.get("/", async function(req, res, next) {
  // Cargamos los datos (Movies) de la API,
  // Los formateamos y comprobamos si existen en DB
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

  // Cargamos los datos (Series) de la API,
  // Los formateamos y comprobamos si existen en DB
  const series = await axios
    .get(apiURL + "/discover/tv", {
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
  const reqSeries = formatedSeries.filter(serie => {
    const isDuplicated = dbSeries.series.find(item => item.id === serie.id);
    return !Boolean(isDuplicated);
  });
  res.render("index", { title: "Freak App" });

  // Guardamos en DB
  saveOnDB(reqMovies, "movies");
  saveOnDB(reqSeries, "series");
});

// HOME VIEW
router.get("/home", function(req, res, next) {
  res.render("home", { title: "Freak App" });
});

// MOVIES VIEW
router.get("/movies", async function(req, res) {
  // Comprobamos filtro de género
  const genreFilter =
    req.query.genre && req.query.genre !== undefined
      ? req.query.genre
      : undefined;

  // Comprobamos filtro de búsqueda
  const searchFilter =
    req.query.search && req.query.search !== undefined
      ? req.query.search
      : undefined;

  // Comprobamos petición ajax
  const isAjaxRequest =
    req.query.ajaxReq && req.query.ajaxReq !== false
      ? req.query.ajaxReq
      : false;

  // Comprobamos si se ha borrado la búsqueda
  const searchempty =
    req.query.searchempty && req.query.searchempty !== false
      ? req.query.searchempty
      : false;

  // Obtenemos los géneros
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
    // Si es ajax cargaremos los datosd esde la API,
    // para obtener mas pelis y guardarlas.
    const movies = await axios
      .get(apiURL + "/discover/movie", {
        params: {
          api_key: process.env.TMDB_API_KEY,
          language: "es-ES",
          region: "ES"
        }
      })
      .catch(e => res.status(500).send("error"));

    if (genreFilter) {
      // Buscamos por género en la API
      let filteredMovies;
      if (genreFilter == "all") {
        filteredMovies = movies.data.results;
      } else {
        filteredMovies = movies.data.results.filter(
          movie => movie.genre_ids.indexOf(parseInt(genreFilter)) >= 0
        );
      }
      // Formateamos los datos para añadir propiedades
      const formatedMovies = filteredMovies.map(movie => ({
        ...movie,
        rating: 0,
        isFav: false,
        onLibrary: false
      }));
      // Comprobamos los datos que ya existen
      // y devolvemos los que no para guardarlos
      const reqMovies = formatedMovies.filter(movie => {
        const isDuplicated = dbMovies.movies.find(item => item.id === movie.id);
        return !Boolean(isDuplicated);
      });
      // Guardamos los datos que no existen
      saveOnDB(reqMovies, "movies");
      // Devolvemos a la vista los datos formateados
      return res.status(200).json({ movies: formatedMovies });
    }

    if (searchFilter) {
      // Buscamos por término en la API
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

      // Formateamos los datos para añadir propiedades
      const formatedMovies = movies.data.results.map(movie => ({
        ...movie,
        rating: 0,
        isFav: false,
        onLibrary: false
      }));
      // Comprobamos los datos que ya existen
      // y devolvemos los que no para guardarlos
      const reqMovies = formatedMovies.filter(movie => {
        const isDuplicated = dbMovies.movies.find(item => item.id === movie.id);
        return !Boolean(isDuplicated);
      });
      // Guardamos los datos que no existen
      saveOnDB(reqMovies, "movies");
      // Devolvemos a la vista los datos formateados
      return res.status(200).json({ movies: formatedMovies });
    }
    if (searchempty) {
      // Si se borra el campo de búsqueda,
      // cargamos los datos de la DB
      const movies = dbMovies.movies;
      return res.status(200).json({ movies: movies });
    }
  } else {
    // Si no es ajax, cargamos de la DB
    // que ya hemos guardado en la vista Index
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
  const movie = dbMovies.movies.find(item => item.id === parseInt(movieId));

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

// SET RATING MOVIE
router.patch("/set-rating/:id", async function(req, res) {
  dbMovies.movies.forEach(movie => {
    if (parseInt(movie.id) === parseInt(req.params.id)) {
      movie.rating = req.body.rating;
    }
  });
  fs.writeFileSync(dbMoviesPath, JSON.stringify(dbMovies), "utf8");

  return res
    .status(200)
    .json({ resp: "OK", dato: "algo", data: req.body.rating });
});

// LIBRARY VIEW
router.get("/library", async function(req, res) {
  const movies = dbMovies.movies.filter(movie => movie.onLibrary === true);
  res.render("movies", {
    title: "Freak App | Library",
    page: "library",
    movies: movies
  });
});

// FAVS VIEW
router.get("/favs", async function(req, res) {
  const movies = dbMovies.movies.filter(movie => movie.isFav === true);
  res.render("movies", {
    title: "Freak App | Favs",
    page: "favs",
    movies: movies
  });
});

// SERIES VIEW
// router.get("/series", async function(req, res) {
//   const series = await axios
//     .get(apiURL + "/discover/tv", {
//       params: {
//         api_key: process.env.TMDB_API_KEY,
//         language: "es-ES",
//         region: "ES"
//       }
//     })
//     .catch(e => res.status(500).send("error"));

//   const genres = await axios
//     .get(apiURL + "/genre/tv/list", {
//       params: {
//         api_key: process.env.TMDB_API_KEY,
//         language: "es-ES",
//         region: "ES"
//       }
//     })
//     .catch(e => res.status(500).send("error"));

//   const formatedSeries = series.data.results.map(serie => ({
//     ...serie,
//     rating: 0,
//     isFav: false,
//     onLibrary: false
//   }));

//   const uniqueSeries = formatedSeries.filter(serie => {
//     const isDuplicated = dbSeries.series.find(item => item.id === serie.id);
//     return !Boolean(isDuplicated);
//   });

//   res.render("series", {
//     title: "Freak App | Series",
//     page: "series",
//     series: formatedSeries,
//     genres: genres.data.genres
//   });
//   saveOnDB(uniqueSeries, "series");
// });

module.exports = router;
