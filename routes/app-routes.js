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

// Save on DB
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

  let movies;

  if (isAjaxRequest) {
    let filteredMovies;
    let formatedMovies;
    if (genreFilter) {
      // Get Filtered Movies from API
      // movies = await axios
      //   .get(apiURL + "/search/movie", {
      //     params: {
      //       api_key: process.env.TMDB_API_KEY,
      //       language: "es-ES",
      //       region: "ES",
      //       query: searchFilter
      //     }
      //   })
      //   .catch(e => res.status(500).send("error"));

      // GET Filtered Movies from DB
      if (genreFilter == "all") {
        filteredMovies = dbMovies.movies;
      } else {
        filteredMovies = dbMovies.movies.filter(
          movie => movie.genre_ids.indexOf(parseInt(genreFilter)) >= 0
        );
      }

      formatedMovies = filteredMovies.map(movie => ({
        ...movie,
        rating: 0,
        isFav: false,
        onLibrary: false
      }));

      const uniqueMovies = formatedMovies.filter(movie => {
        const isDuplicated = dbMovies.movies.find(item => item.id === movie.id);
        return !Boolean(isDuplicated);
      });
      saveOnDB(uniqueMovies, "movies");
      movies = filteredMovies.data.results;
    }
    if (searchFilter) {
      filteredMovies = dbMovies.movies.filter(
        movie => movie.title.indexOf(searchFilter) >= 0
      );

      formatedMovies = filteredMovies.map(movie => ({
        ...movie,
        rating: 0,
        isFav: false,
        onLibrary: false
      }));

      const uniqueMovies = formatedMovies.filter(movie => {
        const isDuplicated = dbMovies.movies.find(item => item.id === movie.id);
        return !Boolean(isDuplicated);
      });
      saveOnDB(uniqueMovies, "movies");
      movies = filteredMovies;
    }
    return res.status(200).json({ movies: movies });
  }

  // No Filters
  else {
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

    const formatedMovies = movies.data.results.map(movie => ({
      ...movie,
      rating: 0,
      isFav: false,
      onLibrary: false
    }));

    const uniqueMovies = formatedMovies.filter(movie => {
      const isDuplicated = dbMovies.movies.find(item => item.id === movie.id);
      return !Boolean(isDuplicated);
    });

    res.render("movies", {
      title: "Freak App | Movies",
      page: "movies",
      series: formatedMovies,
      genres: genres.data.genres
    });

    saveOnDB(uniqueMovies, "movies");
  }
});

// MOVIES SEARCH FILTER - AJAX
// router.get("/search-movies", async function(req, res) {
//   const searchTerm =
//     req.query.search && req.query.search !== "null"
//       ? req.query.search
//       : undefined;

//   const movies = await axios
//     .get(apiURL + "/search/movie", {
//       params: {
//         api_key: process.env.TMDB_API_KEY,
//         language: "es-ES",
//         region: "ES",
//         query: searchTerm
//       }
//     })
//     .catch(e => res.status(500).send("error"));

//   const formatedMovies = movies.data.results.map(movie => ({
//     ...movie,
//     rating: 0,
//     isFav: false,
//     onLibrary: false
//   }));

//   const uniqueMovies = formatedMovies.filter(movie => {
//     const isDuplicated = dbMovies.movies.find(item => item.id === movie.id);
//     return !Boolean(isDuplicated);
//   });
//   saveOnDB(uniqueMovies, "movies");
//   console.log(formatedMovies);
//   return res.status(200).json({ movies: formatedMovies });
// });

// MOVIE DETAILS
router.get("/movie/:id", async function(req, res) {
  const movieId = req.params.id;

  const movie = await axios
    .get(apiURL + "/movie/" + movieId, {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  const moviesGenres = await axios
    .get(apiURL + "/genre/movie/list", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  res.render("movie-details", {
    title: "Freak App | Movie Details",
    page: "movie-details",
    movie: movie.data,
    genres: moviesGenres
  });
});

// MOVIES GENRE FILTER
// router.get("/movies/genre/:id", async function(req, res) {
//   const genre = req.params.id;
//   const movies = dbMovies.movies;
//   let moviesByGenre;

//   // Get Movies Genres
//   const moviesGenres = await axios
//     .get(apiURL + "/genre/movie/list", {
//       params: {
//         api_key: process.env.TMDB_API_KEY,
//         language: "es-ES",
//         region: "ES"
//       }
//     })
//     .catch(e => res.status(500).send("error"));

//   // Chek for current genre
//   if (genre) {
//     moviesByGenre = movies.filter(
//       movie => movie.genre_ids.indexOf(parseInt(genre)) >= 0
//     );
//   } else {
//     moviesByGenre = movies;
//   }

//   res.render("movies", {
//     title: "Freak App | Movies",
//     page: "movies",
//     movies: moviesByGenre,
//     genres: moviesGenres.data.genres,
//     currentGenre: parseInt(genre)
//   });
// });

// SERIES VIEW
router.get("/series", async function(req, res) {
  // Get Series
  const series = await axios
    .get(apiURL + "/discover/tv", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  const seriesGenres = await axios
    .get(apiURL + "/genre/tv/list", {
      params: {
        api_key: process.env.TMDB_API_KEY,
        language: "es-ES",
        region: "ES"
      }
    })
    .catch(e => res.status(500).send("error"));

  // Custom Series Attrs
  const formatedSeries = series.data.results.map(serie => ({
    ...serie,
    rating: 0,
    isFav: false,
    onLibrary: false
  }));

  // Check for duplicated
  const uniqueSeries = formatedSeries.filter(serie => {
    const isDuplicated = dbSeries.series.find(item => item.id === serie.id);
    return !Boolean(isDuplicated);
  });

  // Render
  res.render("series", {
    title: "Freak App | Series",
    page: "series",
    series: formatedSeries,
    genres: seriesGenres.data.genres
  });

  // Save on DB
  saveOnDB(uniqueSeries, "series");
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

// MOVIE DETAILS
// {
//   adult: false,
//   backdrop_path: '/3s9O5af2xWKWR5JzP2iJZpZeQQg.jpg',
//   belongs_to_collection:
//    { id: 328,
//      name: 'Jurassic Park - Colección',
//      poster_path: '/hO1Ix2mXeOZ9siKY6gSjHApONdK.jpg',
//      backdrop_path: '/pJjIH9QN0OkHFV9eue6XfRVnPkr.jpg' },
//   budget: 170000000,
//   genres:
//    [ { id: 28, name: 'Acción' },
//      { id: 12, name: 'Aventura' },
//      { id: 878, name: 'Ciencia ficción' } ],
//   homepage: 'http://www.jurassicworld.com',
//   id: 351286,
//   imdb_id: 'tt4881806',
//   original_language: 'en',
//   original_title: 'Jurassic World: Fallen Kingdom',
//   overview: 'Tras cuatro años de abandono del complejo turístico Jurassic World, la isla Nublar solo está habitada por los dinosaurios supervivientes. Pero, cuando un volcán entra en erupción, Owen (Chris Pratt) y Claire (Bryce Dallas Howard) vuelven allí para rescatar a los dinosaurios de la extinción: el primero va en busca de Blue, el raptor que crio, mientras que la segunda quiere salvar a todos los ejemplares de las demás especies. Sin embargo, en las antiguas instalaciones del parque no estarán solos, ya que en ellas descubren una conspiración que pretende llevar al planeta de nuevo a la era prehistórica.',
//   popularity: 228.903,
//   poster_path: '/zeNCIgB4cfAN7dKRsCuDeLIgrYy.jpg',
//   production_companies:
//    [ { id: 56,
//        logo_path: '/cEaxANEisCqeEoRvODv2dO1I0iI.png',
//        name: 'Amblin Entertainment',
//        origin_country: 'US' },
//      { id: 8111,
//        logo_path: null,
//        name: 'Apaches Entertainment',
//        origin_country: '' },
//      { id: 923,
//        logo_path: '/5UQsZrfbfG2dYJbx8DxfoTr2Bvu.png',
//        name: 'Legendary Entertainment',
//        origin_country: 'US' },
//      { id: 33,
//        logo_path: '/8lvHyhjr8oUKOOy2dKXoALWKdp0.png',
//        name: 'Universal Pictures',
//        origin_country: 'US' },
//      { id: 10338,
//        logo_path: '/el2ap6lvjcEDdbyJoB3oKiYgXu9.png',
//        name: 'Perfect World Pictures',
//        origin_country: 'CN' },
//      { id: 862,
//        logo_path: '/udTjbqPmcTbfrihMuLtLcizDEM1.png',
//        name: 'The Kennedy/Marshall Company',
//        origin_country: 'US' } ],
//   production_countries: [ { iso_3166_1: 'US', name: 'United States of America' } ],
//   release_date: '2018-06-06',
//   revenue: 0,
//   runtime: 128,
//   spoken_languages:
//    [ { iso_639_1: 'en', name: 'English' },
//      { iso_639_1: 'ru', name: 'Pусский' } ],
//   status: 'Released',
//   tagline: 'La vida se abre camino',
//   title: 'Jurassic World: El reino caído',
//   video: false,
//   vote_average: 6.5,
//   vote_count: 3145
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
