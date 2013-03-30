/**
 * This function trims a string of leading and trailing whitespace.
 * @return {String} The string stripped of whitespace from both ends.
 * @see MDN's <a href="https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/String/Trim">trim documentation</a>.
 */
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}


/* constant for golden ratio conjugate, which will be used in layouts. */
var PHI = 0.6180339887498948;

var keyboard = "";
var keyboardLoaded = false;

var lessons = [];
var lessonsLoaded = false;

var currentLesson = 0;
var currentSlide = 0;




// GRAB COOKIES

var cookies = document.cookie.split(';');

for (var i = 0; i < cookies.length; i++) {
  var cookieName = cookies[i].split('=')[0].trim();
  var cookieValue = cookies[i].split('=')[1].trim();

  if (cookieName === 'currentLesson') {
    console.log("COOKIE FOUND!");
    currentLesson = parseInt(cookieValue, 10);
  }
}



var xhrGet = function(reqUri, callback, type) {
  var xhr = new XMLHttpRequest();

  xhr.open('GET', reqUri, true);
    
  if (type) {
  	xhr.requestType = type;
  }
    
  xhr.onload = callback;
    
  xhr.send();
};

var xhrPost = function(reqUri, params, callback) {
  var xhr = new XMLHttpRequest();

  xhr.open('POST', reqUri, true);
    
  if (callback) {
    xhr.onload = callback;
  }

  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");  
  xhr.send(params);
};


var loadLessonData = function() {
	lessons = JSON.parse(this.responseText);
  lessonsLoaded = true;
  showSlide(currentLesson, currentSlide);
};

var loadBlankQwertyKeyboard = function() {
  keyboard = this.responseText;
  keyboardLoaded = true;
};


var showKeyboard = function(translation) {

}



var adjustKeyboard = function() {
  var standardKeyboardElement = document.getElementById("standard-keyboard");
  standardKeyboardElement.style.height = document.height * (1 - PHI) + "px";
  standardKeyboardElement.style.width = 3 * document.height * (1 - PHI) + "px";

  var keyHeight = document.getElementsByClassName("standard-row")[0].offsetHeight;
  var standardKeyElements = document.getElementsByClassName("standard-key");

  for (var i = 0; i < standardKeyElements.length; i++) {
    standardKeyElements[i].style.fontSize = (keyHeight * 0.9 / 3) + "px";
    standardKeyElements[i].style.lineHeight = (keyHeight * 0.9) + "px";
     
  }
}



var showSlide = function(lesson, slide) {
  var headerDiv = document.getElementById("header");
  var htmlDiv = document.getElementById("html");
  var keyboardDiv = document.getElementById("keyboard");

  console.log(lessons[lesson].slides[slide].header);
  console.log(lessons[lesson].slides[slide].html);
  console.log(lessons[lesson].slides[slide].keyboard);
  
  if (lessons[lesson].slides[slide].header && 
      lessons[lesson].slides[slide].html &&
      lessons[lesson].slides[slide].keyboard) {
    headerDiv.style.display = "block";
    headerDiv.style.position = "absolute";
    headerDiv.style.top = "0px";
    headerDiv.style.left = "0px";
    headerDiv.style.height = (PHI * (1 - PHI) * 100) + "%";
    headerDiv.style.width = "100%";
    headerDiv.style.backgroundColor = "#FF0000";
    headerDiv.innerHTML = lessons[lesson].slides[slide].header;   

    htmlDiv.style.display = "block";
    htmlDiv.style.position = "absolute";
    htmlDiv.style.top = (PHI * (1 - PHI) * 100) + "%";
    htmlDiv.style.left = "0px";
    htmlDiv.style.height = (PHI * PHI * 100) + "%";
    htmlDiv.style.width = "100%";
    htmlDiv.style.backgroundColor = "#00FF00";    
    htmlDiv.innerHTML = lessons[lesson].slides[slide].html;   

    keyboardDiv.style.display = "block";
    keyboardDiv.style.position = "absolute";
    keyboardDiv.style.top = (PHI * 100) + "%";
    keyboardDiv.style.left = "0px";
    keyboardDiv.style.height = ((1 - PHI) * 100) + "%";
    keyboardDiv.style.width = "100%";
    keyboardDiv.style.backgroundColor = "#0000FF";    
    keyboardDiv.innerHTML = keyboard;

    adjustKeyboard();  
  } else if (lessons[lesson].slides[slide].header && 
             lessons[lesson].slides[slide].html &&
             !lessons[lesson].slides[slide].keyboard) {
    headerDiv.style.display = "block";
    headerDiv.style.position = "absolute";
    headerDiv.style.top = "0px";
    headerDiv.style.left = "0px";
    headerDiv.style.height = ((1 - PHI) * 100) + "%";
    headerDiv.style.width = "100%";
    headerDiv.style.backgroundColor = "#FF0000";
    headerDiv.innerHTML = lessons[lesson].slides[slide].header;   

    htmlDiv.style.display = "block";
    htmlDiv.style.position = "absolute";
    htmlDiv.style.top = ((1 - PHI) * 100) + "%";
    htmlDiv.style.left = "0px";
    htmlDiv.style.height = (PHI * 100) + "%";
    htmlDiv.style.width = "100%";
    htmlDiv.style.backgroundColor = "#00FF00";    
    htmlDiv.innerHTML = lessons[lesson].slides[slide].html;   

    keyboardDiv.style.display = "none";  
  } else if (lessons[lesson].slides[slide].header && 
             !lessons[lesson].slides[slide].html &&
             !lessons[lesson].slides[slide].keyboard) {
    headerDiv.style.display = "block";
    headerDiv.style.position = "absolute";
    headerDiv.style.top = "50%";
    headerDiv.style.left = "0px";
    headerDiv.style.height = "auto";
    headerDiv.style.width = "100%";
    headerDiv.style.backgroundColor = "#FF0000";
    headerDiv.innerHTML = lessons[lesson].slides[slide].header;   

    htmlDiv.style.display = "none";
    
    keyboardDiv.style.display = "none";  
  }
}














window.onclick = function() {
  if (lessonsLoaded) {
    currentSlide++;
    
    if (currentSlide < lessons[currentLesson].slides.length) {
      showSlide(currentLesson, currentSlide);  
    } else {
      currentLesson++;
      currentSlide = 0;
      xhrPost("/tutor", "ploverdojo_currentlesson=" + currentLesson);  
      showSlide(currentLesson, currentSlide);  
    }
  }
}





window.onload = function() {
  xhrGet("../assets/tutorLessons.json", loadLessonData, null);
  xhrGet("../assets/qwertyKeyboard.html", loadBlankQwertyKeyboard, null);  
};