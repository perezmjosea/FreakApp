const searchField = document.querySelector("#search-control");

function updateView(data) {
  const movies = data.movies;
  let moviesHtml = "";

  if (movies.length > 0) {
    moviesHtml += "<div class='row'>";
    movies.forEach(movie => {
      moviesHtml += "<div class='col-12 col-sm-6 col-md-4 movie'>";
      moviesHtml += "<div class='card'>";
      moviesHtml += "<div class='card-header'>";
      moviesHtml += `<img class='card-img-top' src='http://image.tmdb.org/t/p/w500${
        movie.poster_path
      }' alt='${movie.title}' title='${movie.title}'>`;
      moviesHtml += "</div>";
      moviesHtml += "<div class='card-body'>";
      moviesHtml += `<h5 class="card-title">${movie.title}</h5>`;
      moviesHtml += `<p class='card-text'>${movie.overview}</p>`;
      moviesHtml += "</div>";
      moviesHtml += "<div class='card-footer'>";
      moviesHtml += `<a class='btn primary-btn btn-sm' href='/movie/${
        movie.id
      }'>Details</a>`;
      moviesHtml += "</div>";
      moviesHtml += "</div>";
      moviesHtml += "</div>";
    });
    moviesHtml += "</div>";
  } else {
    moviesHtml += "<div class='row'>";
    moviesHtml += "<p>No hay resultados en esta categoría</p>";
    moviesHtml += "</div>";
  }

  document.querySelector("#movies").innerHTML = moviesHtml;
  $(".loading-mask").hide();
}
function filterBySearch(e) {
  const searchFilter = document.querySelector("#search-control").value;
  if (searchFilter.length > 2) {
    $(".loading-mask").show();

    fetch(`http://localhost:3000/movies?search=${searchFilter}&ajaxReq=true`)
      .then(resp => resp.json())
      .then(data => updateView(data))
      .catch(err => console.log(err));
  }
  if (searchFilter.length == 0) {
    $(".loading-mask").show();

    fetch(`http://localhost:3000/movies?searchempty=true&ajaxReq=true`)
      .then(resp => resp.json())
      .then(data => updateView(data))
      .catch(err => console.log(err));
  }
}

function filterByGenre(genre) {
  const genreFilter = genre;
  if (genreFilter) {
    $(".loading-mask").show();

    fetch(`http://localhost:3000/movies?genre=${genreFilter}&ajaxReq=true`)
      .then(resp => resp.json())
      .then(data => updateView(data))
      .catch(err => console.log(err));
    $(".genre-filter-link").removeClass("active");
    $(`.genre-filter-link[data-genre=${genreFilter}]`).addClass("active");
  }
}

searchField.addEventListener("keyup", filterBySearch);
