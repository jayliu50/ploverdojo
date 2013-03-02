var placeCenterMiddle = function (selector) {
  if ($(selector).length !== 0) {
    $(selector).css({
      "position": "absolute",
      "left": ($(selector).parent().innerWidth() - $(selector).outerWidth()) * 0.5,
      "top": ($(selector).parent().innerHeight() - $(selector).outerHeight()) * 0.5
    });
  } else {
    console.warn("placeCenterMiddle called with improper parameters!");
  }
};


var fitText = function (selector) {
  if ($(selector).length !== 0) {
    $(selector).css("white-space", "nowrap");

    var maxWidth = $(selector).parent().innerWidth();
    var maxHeight = $(selector).parent().innerHeight();

    for (var fontSize = maxHeight; fontSize >= 0; fontSize--) {
      $(selector).css("font-size", fontSize);
      if ($(selector).outerWidth() < maxWidth) {
        return;
      }
    }
  } else {
    console.warn("fitText called with improper parameters!");
  }
};


var fontSizeForIdealLineLength = function (width) {
  var testSpan = document.createElement("span");
  testSpan.setAttribute("id", "test-span");
  testSpan.innerHTML = "Quick hijinx swiftly revamped gazebo. Quick hijinx swiftly revamped gazebo.";
  document.body.appendChild(testSpan);
  for (var fontSize = 0; fontSize <= Math.floor(width); fontSize++) {
    $("#test-span").css("font-size", fontSize);
    if ($("#test-span").outerWidth() > width) {
      document.body.removeChild(testSpan);
      return fontSize;
    }
  }
};


var currentSlide = 0;
var switchSlide = function () {
  $("#slide" + currentSlide).hide("drop", {easing: "easeInOutBack", direction: "right"}, 1800);
  currentSlide = (currentSlide + 1) % $(".slide").length;  
  $("#slide" + currentSlide).show("drop", {easing: "easeInOutBack", direction: "left"}, 1800);
};

var slideshowTimer = null;
var startSlideshow = function () {
  $(".slide").css("display", "block");

  // set slide div dimensions.
  $(".slide").css({
    "width": $(window).innerWidth() * 0.6180339887,
    "height": $(window).height() * 0.6180339887
  });

  // set slide div coordinates (requires dimensions, so do that first!).
  $(".slide").css({
    "position": "absolute",
    "left": 0,
    "top": 0
  });

  // set font-size of slide text to ideal line length (60-75 chars).
  $(".slide").css({
    "font-size": fontSizeForIdealLineLength($(window).width() * 0.6180339887)
  });

  $(".slide").css("display", "none");
  
  console.log("show slide " + currentSlide);
  $("#slide" + currentSlide).show("drop", {easing: "easeInOutBack", direction: "left"}, 1800);

  // switch slide every 5 seconds.
  slideshowTimer = setInterval(switchSlide, 5000);
};

var slideshowTimeout = null;
$(window).resize(function (){
  // stop slideshow
  clearInterval(slideshowTimer);
  clearTimeout(slideshowTimeout);
  $(".slide").css("display", "none");
  $(".slide").stop(true, true);
  
  // set title div dimensions.
  $("#title").css({
    "width": $(window).innerWidth() * 0.6180339887,
    "height": $(window).height() * 0.3819660113 * 0.5
  });

  // set title div coordinates (requires dimensions, so do that first!).
  $("#title").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#title").outerWidth()) * 0.5,
    "top": 0
  });

  // set font-size of title-text span to largest fit in title div.
  fitText("#title-text");

  // place title-text span in center-middle of title div.
  placeCenterMiddle("#title-text");


  // set slideshow div dimensions.
  $("#slideshow").css({
    "width": $(window).innerWidth() * 0.6180339887,
    "height": $(window).height() * 0.6180339887
  });

  // set slideshow div coordinates (requires dimensions, so do that first!).
  $("#slideshow").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#slideshow").outerWidth()) * 0.5,
    "top": ($(window).innerHeight() - $("#slideshow").outerHeight()) * 0.5
  });

  // set font-size of slideshow text to ideal line length (60-75 chars).
  $("#slideshow").css({
    "font-size": fontSizeForIdealLineLength($(window).width() * 0.6180339887)
  });


  // set more-info div dimensions.
  $("#more-info").css({
    "width": $(window).innerWidth() * 0.6180339887,
    "height": $(window).height() * 0.6180339887
  });

  // set more-info div coordinates (requires dimensions, so do that first!).
  $("#more-info").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#more-info").outerWidth()) * 0.5,
    "top": ($(window).innerHeight() - $("#more-info").outerHeight()) * 0.5
  });

  // set font-size of more-info text to ideal line length (60-75 chars).
  $("#more-info").css({
    "font-size": fontSizeForIdealLineLength($(window).width() * 0.6180339887)
  });


  // set get-started-button div dimensions.
  $("#get-started-button").css({
    "width": $(window).innerWidth() * 0.6180339887 * 0.4,
    "height": $(window).height() * 0.3819660113 * 0.5
  });

  // set get-started-button div coordinates (requires dimensions, so do that first!).
  $("#get-started-button").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#title").outerWidth()) * 0.5,
    //"top": $(window).height() * 0.3819660113 * 0.5 + $(window).height() * 0.6180339887
    "bottom": 0
  });

  // set font-size of get-started-button-text span to largest fit in get-started-button div.
  fitText("#get-started-button-text");

  // place get-started-button-text span in center-middle of get-started-button div.
  placeCenterMiddle("#get-started-button-text");


  // set learn-more-button div dimensions.
  $("#learn-more-button").css({
    "width": $(window).innerWidth() * 0.6180339887 * 0.4,
    "height": $(window).height() * 0.3819660113 * 0.5
  });

  // set learn-more-button div coordinates (requires dimensions, so do that first!).
  $("#learn-more-button").css({
    "position": "absolute",
    "right": ($(window).innerWidth() - $("#title").outerWidth()) * 0.5,
    //"left": ($(window).innerWidth() - $("#title").outerWidth()) * 0.5 + $(window).innerWidth() * 0.6180339887 * 0.5,
    //"top": $(window).height() * 0.3819660113 * 0.5 + $(window).height() * 0.6180339887
    "bottom": 0
  });

  // set font-size of learn-more-button-text span to largest fit in learn-more-button div.
  fitText("#learn-more-button-text");

  // place learn-more-button-text span in center-middle of learn-more-button div.
  placeCenterMiddle("#learn-more-button-text");
  
  // delay slideshow from starting to prevent buildup while user is resizing.
  slideshowTimeout = setTimeout(startSlideshow, 150);
});


$(window).load(function () {
  // THE FLOW OF THINGS WILL BE ABSTRACTED OUT IN THE FUTURE




  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //  @ 0 seconds                                                            //
  //  properly place and size the intro elements, then fade them in.         //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////


  // turn "on" intro elements so the adjusting functions work.
  $("#welcome").css("display", "block");
  $("#title").css("display", "block");
  $("#tagline").css("display", "block");
  $("#disclaimer").css("display", "block");


  // set title div dimensions.
  $("#title").css({
    "width": $(window).innerWidth() * 0.6180339887,
    "height": $(window).height() * 0.3819660113 * 0.5
  });

  // set title div coordinates (requires dimensions, so do that first!).
  $("#title").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#title").outerWidth()) * 0.5,
    "top": ($(window).innerHeight() - $("#title").outerHeight()) * 0.5
  });

  // set font-size of title-text span to largest fit in title div.
  fitText("#title-text");

  // place title-text span in center-middle of title div.
  placeCenterMiddle("#title-text");


  // set welcome div dimensions.
  $("#welcome").css({
    "width": $(window).innerWidth() * 0.6180339887,
    "height": parseInt($("#title-text").css("font-size"), 10) * 0.7
  });

  // set welcome div coordinates (requires dimensions, so do that first!)
  $("#welcome").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#welcome").outerWidth()) * 0.5,
    "top": ($(window).innerHeight() - $("#welcome").outerHeight()) * 0.5 - parseInt($("#title-text").css("font-size"), 10) * 0.9
  });

  // set font-size of welcome-text span to largest fit in welcome div.
  fitText("#welcome-text");

  // place welcome-text span in center-middle of welcome div
  placeCenterMiddle("#welcome-text");


  // set tagline div dimensions.
  $("#tagline").css({
    "width": $(window).innerWidth() * 0.6180339887,
    "height": parseInt($("#title-text").css("font-size"), 10) * 0.6180339887
  });

  // set tagline div coordinates (requires dimensions, so do that first!)
  $("#tagline").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#tagline").outerWidth()) * 0.5,
    "top": ($(window).innerHeight() - $("#tagline").outerHeight()) * 0.5 + parseInt($("#title-text").css("font-size"), 10) * 0.7
  });

  // set font-size of tagline-text span to largest fit in tagline div.
  fitText("#tagline-text");

  // place tagline-text span in center-middle of tagline div
  placeCenterMiddle("#tagline-text");


  // set disclaimer div dimensions.
  $("#disclaimer").css({
    "width": $(window).innerWidth() * 0.8,
    "height": 14
  });

  // set disclaimer div coordinates (requires dimensions, so do that first!)
  $("#disclaimer").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#disclaimer").outerWidth()) * 0.5,
    "top": $(window).innerHeight() * 0.8
  });

  // set font-size of tagline-text span to largest fit in tagline div.
  fitText("#disclaimer-text");

  // place tagline-text span in center-middle of tagline div
  placeCenterMiddle("#disclaimer-text");


  // turn "off" intro elements and fade them in.
  $("#welcome").css("display", "none");
  $("#welcome").fadeIn(900, "easeInOutSine");
  $("#title").css("display", "none");
  $("#title").fadeIn(900, "easeInOutSine");
  $("#tagline").css("display", "none");
  $("#tagline").fadeIn(900, "easeInOutSine");


  //show disclaimer
  $("#disclaimer").css("display", "none");
  $("#disclaimer").toggle("drop", {easing: "easeInOutBack", direction: "left"}, 1800);




  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //  @ 5 seconds                                                            //
  //  fade out welcome and tagline and move title to the top.                //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////


  // fade out welcome and tagline.
  $("#welcome").delay(5000).fadeOut(900, "easeInOutSine");
  $("#tagline").delay(5000).fadeOut(900, "easeInOutSine");


  // move title to the top.
  $("#title").delay(5900).animate({
    left: $(window).width() * 0.3819660113 * 0.5,
    top: 0
  }, 1100, "easeInOutBack");


  // remove disclaimer
  $("#disclaimer").delay(5000).toggle("drop", {easing: "easeInOutBack", direction: "right"}, 900);




  /////////////////////////////////////////////////////////////////////////////
  //                                                                         //
  //  @ 7 seconds                                                            //
  //  fade in slideshow and buttons.                                         //
  //                                                                         //
  /////////////////////////////////////////////////////////////////////////////


  // turn "on" rest of page elements so the adjusting functions work.
  $("#slideshow").css("display", "block");
  $("#more-info").css("display", "block");
  $("#get-started-button").css("display", "block");
  $("#learn-more-button").css("display", "block");


  // set slideshow div dimensions.
  $("#slideshow").css({
    "width": $(window).innerWidth() * 0.6180339887,
    "height": $(window).height() * 0.6180339887
  });

  // set slideshow div coordinates (requires dimensions, so do that first!).
  $("#slideshow").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#slideshow").outerWidth()) * 0.5,
    "top": ($(window).innerHeight() - $("#slideshow").outerHeight()) * 0.5
  });

  // set font-size of slideshow text to ideal line length (60-75 chars).
  $("#slideshow").css({
    "font-size": fontSizeForIdealLineLength($(window).width() * 0.6180339887)
  });


  // set more-info div dimensions.
  $("#more-info").css({
    "width": $(window).innerWidth() * 0.6180339887,
    "height": $(window).height() * 0.6180339887
  });

  // set more-info div coordinates (requires dimensions, so do that first!).
  $("#more-info").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#more-info").outerWidth()) * 0.5,
    "top": ($(window).innerHeight() - $("#more-info").outerHeight()) * 0.5
  });

  // set font-size of more-info text to ideal line length (60-75 chars).
  $("#more-info").css({
    "font-size": fontSizeForIdealLineLength($(window).width() * 0.6180339887)
  });


  // set get-started-button div dimensions.
  $("#get-started-button").css({
    "width": $(window).innerWidth() * 0.6180339887 * 0.4,
    "height": $(window).height() * 0.3819660113 * 0.5
  });

  // set get-started-button div coordinates (requires dimensions, so do that first!).
  $("#get-started-button").css({
    "position": "absolute",
    "left": ($(window).innerWidth() - $("#title").outerWidth()) * 0.5,
    //"top": $(window).height() * 0.3819660113 * 0.5 + $(window).height() * 0.6180339887
    "bottom": 0
  });

  // set font-size of get-started-button-text span to largest fit in get-started-button div.
  fitText("#get-started-button-text");

  // place get-started-button-text span in center-middle of get-started-button div.
  placeCenterMiddle("#get-started-button-text");


  // set learn-more-button div dimensions.
  $("#learn-more-button").css({
    "width": $(window).innerWidth() * 0.6180339887 * 0.4,
    "height": $(window).height() * 0.3819660113 * 0.5
  });

  // set learn-more-button div coordinates (requires dimensions, so do that first!).
  $("#learn-more-button").css({
    "position": "absolute",
    "right": ($(window).innerWidth() - $("#title").outerWidth()) * 0.5,
    //"left": ($(window).innerWidth() - $("#title").outerWidth()) * 0.5 + $(window).innerWidth() * 0.6180339887 * 0.5,
    //"top": $(window).height() * 0.3819660113 * 0.5 + $(window).height() * 0.6180339887
    "bottom": 0
  });

  // set font-size of learn-more-button-text span to largest fit in learn-more-button div.
  fitText("#learn-more-button-text");

  // place learn-more-button-text span in center-middle of learn-more-button div.
  placeCenterMiddle("#learn-more-button-text");


  // turn "off" page elements and fade them in.
  $("#slideshow").css("display", "none");
  $("#slideshow").delay(7000).fadeIn(900, "easeInOutSine", startSlideshow);
  $("#more-info").css("display", "none");
  $("#get-started-button").css("display", "none");
  $("#get-started-button").delay(7900).fadeIn(900, "easeInOutSine");
  $("#learn-more-button").css("display", "none");
  $("#learn-more-button").delay(7900).fadeIn(900, "easeInOutSine");


  // toggle more-info div if learn-more-button clicked
  $("#learn-more-button").click(function () {
    if ($("#more-info").css("display") === "none") {
      $("#slideshow").fadeOut(900, "easeInOutSine");
      $("#more-info").fadeIn(900, "easeInOutSine");

      // stop slideshow
      clearInterval(slideshowTimer);
      clearTimeout(slideshowTimeout);
      $(".slide").css("display", "none");
      $(".slide").stop(true, true);
    } else {
      $("#more-info").fadeOut(900, "easeInOutSine");
      $("#slideshow").fadeIn(900, "easeInOutSine");
      slideshowTimeout = setTimeout(startSlideshow, 150);
    }
  });
});