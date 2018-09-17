const movieId = document.querySelector(".movie").getAttribute("id");
const actionFav = document.querySelector("#action-fav");
const actionLibrary = document.querySelector("#action-library");
const toggleFav = document.querySelector("#toggleFav");
const toggleLibrary = document.querySelector("#toggleLibrary");

function toggleFavMovie() {
  fetch(`/toggle-fav/${movieId}`, {
    method: "PATCH"
  })
    .then(resp => actionFav.classList.toggle("secondary"))
    .then(resp => actionFav.classList.toggle("grey"))
    .catch(e => console.log("ERROR", e));
}
function toggleLibraryMovie() {
  fetch(`/toggle-library/${movieId}`, {
    method: "PATCH"
  })
    .then(resp => actionLibrary.classList.toggle("secondary"))
    .then(resp => actionLibrary.classList.toggle("grey"))
    .catch(e => console.log("ERROR", e));
}

toggleFav.addEventListener("change", toggleFavMovie);
toggleLibrary.addEventListener("change", toggleLibraryMovie);
