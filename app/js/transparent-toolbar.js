document.addEventListener( "DOMContentLoaded", function() {

	const ipc = require('electron').ipcRenderer;

	// 1: GET EVERY SINGLE OBJECT IN THE TOOLBAR

	var pencil = document.getElementById("pencil");
	var pencilColor = document.getElementById("pencil_color");
	var rubber = document.getElementById("rubber");
	var ruler = document.getElementById("ruler");
	var allTools = [pencil, rubber];

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

  var undo = document.getElementById("undo");
  var redo = document.getElementById("redo");
  var clearAllBtn = document.getElementById("clear_all");
  var backToMainBtn = document.getElementById("back_to_main");

  var rulerContainer = document.getElementById("ruler_container");

  var toggleNavbar = document.getElementById("toggle_navbar");
  // 2: SET VARIABLES FOR SETTINGS

  //default values
  var lineColor = "black";
  var lineWidth = 2;
  var rubberWidth = 30;

  var toolSelected = "pencil"; //pencil, rubber
  var rulerActive = false;

  // 3: SET SUPPORT FUNCTIONS
	function clearButtonSelection(buttons, _class) {
		for (var i = buttons.length - 1; i >= 0; i--) {
		  buttons[i].classList.remove(_class);
		}
	}

	function showColorButtons(){
		var j = document.getElementsByClassName("btn-toolbar-color");
		for (var i = j.length - 1; i >= 0; i--) {
		  allColors[i].parentElement.classList.remove("btn-hidden");
		  allColors[i].parentElement.classList.add("btn-visible");
		  allColors[i].style.pointerEvents = 'auto';
		};
	}

	function hideColorButtons(){
		var j = document.getElementsByClassName("btn-toolbar-color");
		for (var i = j.length - 1; i >= 0; i--) {
		  allColors[i].parentElement.classList.remove("btn-visible");
		  allColors[i].parentElement.classList.add("btn-hidden");
		  allColors[i].style.pointerEvents = 'none';
		};
	}

  function loadWidth(_tool){
    if(_tool=="pencil") {
      clearButtonSelection(allWidths, "btn-active");
      switch(lineWidth){
        case 1:
          smallWidth.classList.add("btn-active");
          break;
        case 2:
          mediumWidth.classList.add("btn-active");
          break;
        case 4:
          bigWidth.classList.add("btn-active");
          break;
      }
    }
    else if(_tool=="rubber"){
      clearButtonSelection(allWidths, "btn-active");
      switch(rubberWidth){
        case 15:
          smallWidth.classList.add("btn-active");
          break;
        case 30:
          mediumWidth.classList.add("btn-active");
          break;
        case 60:
          bigWidth.classList.add("btn-active");
          break;
      }
    }
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
      lineColor = customColor.getAttribute("value");
      sendLine(lineColor, lineWidth, rubberWidth);
    });
  });
  customColor.addEventListener("click", function() {
    //Voglio che il colore venga settato all'ultimo colore scelto quanto clicco
    lineColor = customColor.getAttribute("value");

    sendLine(lineColor, lineWidth, rubberWidth);
  });

  // 5: MAKE SETTINGS FOR WIDTH
  smallWidth.addEventListener("click", function() {
    if(toolSelected=="rubber")
      rubberWidth = 15;
    if(toolSelected=="pencil")
      lineWidth = 1;
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  mediumWidth.addEventListener("click", function() {
    if(toolSelected=="rubber")
      rubberWidth = 40;
    if(toolSelected=="pencil")
      lineWidth = 2;
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  bigWidth.addEventListener("click", function() {
    if(toolSelected=="rubber")
      rubberWidth = 60;
    if(toolSelected=="pencil")
      lineWidth = 4;
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });

  // SETTINGS FOR TOOLS
  pencil.addEventListener("click", function(e) {
    showColorButtons();
    toolSelected="pencil";
    sendTool(this);
  });
  rubber.addEventListener("click", function(e) {
    hideColorButtons();
    toolSelected="rubber";
    sendTool(this);
  });
  ruler.addEventListener("click", function(e) {
    sendTool(this);
  });

  // UNDO & REDO
  var backstack_counter=0;
  var redo_times = 1;

  undo.addEventListener("click",function() {
    ipc.send('send-command', 'canvas', 'undo');
  });
  redo.addEventListener("click",function() {
    ipc.send('send-command', 'canvas', 'redo');
  });
  clearAllBtn.addEventListener("click",function() {
    ipc.send('send-command', 'canvas', 'clearAll');
  });

  // TOGGLE NAVBAR
  var isOpen = true;
  var liArray = document.getElementById("navbar").getElementsByTagName("li");

  function showLi() {
    for (var i = liArray.length - 2; i >= 0; i--) {
      liArray[i].classList.remove("hidden");
    };
  }
  function hideLi() {
    for (var i = liArray.length - 2; i >= 0; i--) {
      liArray[i].classList.add("hidden");
    };
  }

  toggleNavbar.addEventListener("click", function() {
    ipc.send('toggle-navbar', isOpen);
    if (isOpen) {
      this.innerHTML = "<i class=\"material-icons\">mode_edit</i>";
      isOpen = false;
      hideLi()
    } else {
      this.innerHTML = "<i class=\"material-icons\">visibility_off</i>";
      isOpen = true;
      showLi()
    }
  });

  backToMainBtn.addEventListener("click", function() {
     ipc.send('back-to-main');
  });
  // 6: SEND SETTINGS

  // this sends a JS Object containing the settings of the line
	function sendLine(_lineColor, _lineWidth, _rubberWidth) {
    pencilColor.style.borderBottom = "12px solid " + _lineColor;
    ipc.send('send-command', 'canvas', 'setLine', {
      lineColor: _lineColor,
      lineWidth: _lineWidth,
      rubberWidth: _rubberWidth
    });
    console.log('Sent settings!')
  }

  function sendTool(tool){
    if(tool.id!="ruler"){
      clearButtonSelection(allTools, "btn-tool-active");
      tool.classList.add("btn-tool-active");
    }
    else{
      rulerActive=!rulerActive;
      if(rulerActive)  tool.classList.add("btn-tool-active");
      else             tool.classList.remove("btn-tool-active");
    }
    ipc.send('send-command', 'canvas', 'setTool', {tool: tool.id});
  }

	ipc.on('send-command', function(e, command, parameters) {
    switch (command) {
      case "updateBackstackButtons":
        if(parameters.redo){
          //DISABLE REDO
          redo.style.pointerEvents = 'none';
          redo.classList.add("btn-disabled");
        }
        else{
          //ENABLE REDO
          redo.style.pointerEvents = 'auto';
          redo.classList.remove("btn-disabled");
        }

        if(parameters.undo){
          //DISABLE UNDO
          undo.style.pointerEvents = 'none';
          undo.classList.add("btn-disabled");
        }
        else{
          //ENABLE REDO
          undo.style.pointerEvents = 'auto';
          undo.classList.remove("btn-disabled");
        }
        break;
      case "hideLi":
        toggleNavbar.innerHTML = "<i class=\"material-icons\">arrow_back</i>";
        isOpen = false;
        hideLi();
        break;
      case "loadWidth":
        loadWidth(parameters.tool);
        break;
      default:
        console.log("Unhandled command: " + command);
        break;
    }
  });
});
