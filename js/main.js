function centerfy(selector) {
  $(selector).css({
    "position": "absolute",
    "left": ($(window).width() - $(selector).width()) / 2,
    "top": ($(window).height() - $(selector).height()) / 2
  });
}

$(window).resize(function(){
  centerfy("#content");
});

$(document).ready(function() {
  centerfy("#content");
});