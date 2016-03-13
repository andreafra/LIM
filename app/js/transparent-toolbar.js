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
  var clearAllBtn = document.getElementById("clear_all")

  var rulerContainer = document.getElementById("ruler_container");

  var toggleNavbar = document.getElementById("toggle_navbar");
  // 2: SET VARIABLES FOR SETTINGS

  //default values
  var lineColor = "black";
  var lineWidth = 4;
  var rubberWidth = 30;

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
    rubberWidth = 15
    lineWidth = 2
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  mediumWidth.addEventListener("click", function() {
    rubberWidth = 40
    lineWitdh = 4
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });
  bigWidth.addEventListener("click", function() {
    rubberWidth = 60
    lineWidth = 6
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");

    sendLine(lineColor, lineWidth, rubberWidth);
  });

  // SETTINGS FOR TOOLS
  pencil.addEventListener("click", function(e) {
    showColorButtons();
    /*if (toolSelected === "rubber") {
      ctx.strokeStyle = ctx.shadowColor = lineColor;
      ctx.lineWidth = lineWidth;
    }*/
    sendTool(this);
    //ctx.lineWidth = lineWidth;
  });
  rubber.addEventListener("click", function(e) {
    hideColorButtons();
    sendTool(this);
    //ctx.lineWidth = rubberWidth;
  });
  ruler.addEventListener("click", function(e) {
    sendTool(this);
    //ctx.lineWidth = lineWidth;
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
      this.innerHTML = "<i class=\"material-icons\">arrow_back</i>";
      isOpen = false;
      hideLi()
    } else {
      this.innerHTML = "<i class=\"material-icons\">arrow_forward</i>";
      isOpen = true;
      showLi()
    }
  });


  // 6: SEND SETTINGS

  // this sends a JS Object containing the settings of the line
	function sendLine(lineColor, lineWidth, rubberWidth) {
    pencilColor.style.borderBottom = "12px solid " + lineColor;
    ipc.send('send-command', 'canvas', 'setLine', {
      lineColor: lineColor,
      lineWidth: lineWidth,
      rubberWidth: rubberWidth
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
      default:
        console.log("Unhandled command: " + command);
        break;
    }
  });
});
