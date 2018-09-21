const movieId = document.querySelector(".movie").getAttribute("id");
const actionFav = document.querySelector("#action-fav");
const actionLibrary = document.querySelector("#action-library");
const toggleFav = document.querySelector("#toggleFav");
const toggleLibrary = document.querySelector("#toggleLibrary");
const starsRating = document.querySelectorAll("input[name=rating]");
const currentRating = document
  .querySelector("#stars")
  .getAttribute("data-rating");
const currentStar = document.querySelector(`input[value="${currentRating}"]`);

if (currentStar) {
  currentStar.setAttribute("checked", "checked");
}
// $(function() {
//   const rateStars = $("#stars").rateYo({
//     numStars: 5,
//     starWidth: "26px",
//     normalFill: "#a8a8a8",
//     ratedFill: "#dc7921",
//     maxValue: 5,
//     precision: 1,
//     halfStar: true
//   });
// });

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
function setRating(e) {
  fetch(`/set-rating/${movieId}`, {
    method: "PATCH",
    body: JSON.stringify({
      rating: e.currentTarget.value
    }),
    headers: { "Content-Type": "application/json" }
  }).catch(e => console.log("ERROR", e));
}

// rating.addEventListener("rate", () => {});
toggleFav.addEventListener("change", toggleFavMovie);
toggleLibrary.addEventListener("change", toggleLibraryMovie);
starsRating.forEach(item => item.addEventListener("change", setRating));
