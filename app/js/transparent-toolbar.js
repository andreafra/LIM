document.addEventListener( "DOMContentLoaded", function() {

	const ipc = require('electron').ipcRenderer;

	// 1: GET EVERY SINGLE OBJECT IN THE TOOLBAR

	var pencil = document.getElementById("pencil");
	var pencilColor = document.getElementById("pencil_color");
	var rubber = document.getElementById("rubber");
	var ruler = document.getElementById("ruler");
	var allTools = [pencil, rubber, ruler];

	var blackColor = document.getElementById("pencil_black");
	var blueColor = document.getElementById("pencil_blue");
	var redColor = document.getElementById("pencil_red");
	var greenColor = document.getElementById("pencil_green");
	var customColor = document.getElementById("pencil_other");
	var allColors = [blackColor, blueColor, redColor, greenColor, customColor];

	var smallWidth = document.getElementById("stroke_small");
	var mediumWidth = document.getElementById("stroke_medium");
	var bigWidth = document.getElementById("stroke_big");
	var allWidths = [smallWidth, mediumWidth, bigWidth];

  // 2: SET VARIABLES FOR SETTINGS

  //default values
  var lineColor = "black";
  var lineWidth = 4;
  var rubberWidth = 30;

  // 3: SET SUPPORT FUNCTIONS
	function clearButtonSelection(buttons, _class) {
		var colors = buttons;
		for (var i = colors.length - 1; i >= 0; i--) {
		  colors[i].classList.remove(_class);
		}
	}

	function showColorButtons(){
		var _colorButtons = document.getElementsByClassName("btn-toolbar-color");
		for (var i = _colorButtons.length - 1; i >= 0; i--) {
		  _colorButtons[i].classList.remove("btn-hidden");
		  _colorButtons[i].classList.add("btn-visible");
		  _colorButtons[i].style.pointerEvents = 'auto';
		};
	}

	function hideColorButtons(){
		var _colorButtons = document.getElementsByClassName("btn-toolbar-color");
		for (var i = _colorButtons.length - 1; i >= 0; i--) {
		  _colorButtons[i].classList.remove("btn-visible");
		  _colorButtons[i].classList.add("btn-hidden");
		  _colorButtons[i].style.pointerEvents = 'none';
		};
	}

  // 4: MAKE SETTINGS FOR COLOR PICKER
  blackColor.addEventListener("click", function(e) {
    lineColor = "black";
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  blueColor.addEventListener("click", function(e) {
    lineColor ="#2962ff";
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  redColor.addEventListener("click", function(e) {
    lineColor = "#f44336";
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  greenColor.addEventListener("click", function(e) {
    lineColor = "#4caf50";
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  customColor.addEventListener("mouseup", function() {
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");
    document.getElementById("body").lastChild.addEventListener("mouseup", function() {
      lineColor = customColor.getAttribute("value")
    });

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  customColor.addEventListener("click", function() {
    //Voglio che il colore venga settato all'ultimo colore scelto quanto clicco
    lineColor = customColor.getAttribute("value");

    sendLine(lineColor, lineWidth, rubberWidth);
  });

  // 5: MAKE SETTINGS FOR WIDTH
  smallWidth.addEventListener("click", function() {
    if (toolSelected === "rubber") {
      rubberWidth = 15
    } else {
      lineWidth = 2
    }
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  mediumWidth.addEventListener("click", function() {
    if (toolSelected === "rubber") {
      rubberWidth = 40
    } else {
      lineWitdh = 4
    }
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  bigWidth.addEventListener("click", function() {
    if (toolSelected === "rubber") {
      rubberWidth = 60
    } else {
      lineWidth = 6
    }
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });

  // 6: SEND SETTINGS

  // this sends a JS Object containing the settings of the line
	function sendLine(lineColor, lineWidth, rubberWidth) {
    ipc.send('send-command', 'canvas', 'setLine', {
      lineColor: lineColor,
      lineWidth: lineWidth,
      rubberWidth: rubberWidth
    });
    console.log('Sent settings!')
  }

	ipc.on('send-command', function(e, command) {
		console.log(command);
	});
});
