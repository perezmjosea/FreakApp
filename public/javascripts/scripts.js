$(document).ready(function() {
  $(".loading-mask").hide();

  $(".card-text").each(function() {
    let text = $(this).text();
    let truncatedText = text_truncate(text, 120, "...");
    $(this).html(truncatedText);
  });
});

var text_truncate = function(str, length, ending) {
  if (length == null) {
    length = 100;
  }
  if (ending == null) {
    ending = "...";
  }
  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending;
  } else {
    return str;
  }
};
