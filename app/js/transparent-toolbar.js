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

	ipc.send('send-command', 'canvas', 'setLine', 
			{
				//add params here
			}
		);

	ipc.on('send-command', function(e, command) {
		console.log(command);
	});
});
