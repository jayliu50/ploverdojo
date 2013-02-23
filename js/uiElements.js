$("#quiz-prompt").draggable({snap: true, containment: "parent"}).resizable();

$("#user-response").draggable({snap: true, containment: "parent"}).resizable({handles: 'e'});

// make the standard keyboard draggable and resizable. when it is dragged, let it snap to other elements. when it is resized, keep it proportional.
$("#standard-keyboard").draggable({snap: true, containment: "parent"}).resizable({aspectRatio: 750 / 250,
	resize: function(event, ui) {
		var keyHeight = parseInt($(this).children(".standard-row").css("height"));
		$(".standard-key").css({"font-size": (keyHeight * 0.9 / 3) + "px"});
		$(".standard-key").css({"line-height": (keyHeight * 0.9) + "px"});
		$(".standard-key").children(".upper").css({"line-height": (keyHeight * 0.9 / 3 * 2) + "px"});
		$(".standard-key").children(".lower").css({"line-height": (keyHeight * 0.9 / 3) + "px"});
	}
});

// make the steno keyboard draggable and resizable. when it is dragged, let it snap to other elements. when it is resized, keep it proportional.
$("#steno-keyboard").draggable({snap: true, containment: "parent"}).resizable({aspectRatio: 320 / 160,
	resize: function(event, ui) {
		var keyHeight = parseInt($(this).children(".steno-upper-bank").css("height"));
		$(".steno-key").css({"font-size": (keyHeight / 2) + "px"});
		$(".steno-key").css({"line-height": (keyHeight) + "px"});
	}
});

function resize() {
  $("#content").height($(document).height() - ($('#header').height() + 6));  // plus 6 since there is a bottom border on the header with a width of 6
}

window.onload = resize;
window.onresize = resize;