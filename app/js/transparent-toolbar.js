function $ID(__id) {
  return document.getElementById(__id);
}
function $CLASS(__class) {
  return document.getElementsByClassName(__class);
}

document.addEventListener( "DOMContentLoaded", function() {

	const ipc = require('electron').ipcRenderer;

	// 1: GET EVERY SINGLE OBJECT IN THE TOOLBAR

 var pencil = $ID("pencil");
  var pencilColor = $ID("pencil_color");
  var marker = $ID("marker");
  var markerColor = $ID("marker_color");
  var rubber = $ID("rubber");
  var ruler = $ID("ruler");
  var allTools = [pencil, marker, rubber, ruler];

  var colorPicker = $ID("color_picker");
  /*
  var blackColor = $ID("pencil_black");
  var blueColor = $ID("pencil_blue");
  var redColor = $ID("pencil_red");
  var greenColor = $ID("pencil_green");
  var customColor = $ID("pencil_other");
*/

  var allColors = $CLASS("btn-toolbar-color");

  var smallWidth = $ID("stroke_small");
  var mediumWidth = $ID("stroke_medium");
  var bigWidth = $ID("stroke_big");
  var customWidth = $ID("stroke_slider");
  var allWidths = [smallWidth, mediumWidth, bigWidth];

  var undo = document.getElementById("undo");
  var redo = document.getElementById("redo");
  var clearAllBtn = document.getElementById("clear_all");
  var backToMainBtn = document.getElementById("back_to_main");

  var rulerContainer = document.getElementById("ruler_container");

  var toggleNavbar = document.getElementById("toggle_navbar");
  // 2: SET VARIABLES FOR SETTINGS

  //default values
  var lineColor = "#000000";
  var lineWidth = 2;
  var markerWidth = 10;
  var rubberWidth = 30;

  var toolSelected = 1;
  var rulerActive = false;

  // 3: SET SUPPORT FUNCTIONS
  function clearButtonSelection(buttons, _class) {
    for (var i = buttons.length - 1; i >= 0; i--) {
      buttons[i].classList.remove(_class);
    }
  }

  function showColorButtons(){
    colorPicker.classList.remove("btn-hidden");
    colorPicker.classList.add("btn-visible");
    for (var i = allColors.length -1; i >= 0; i--) {
      allColors[i].style.pointerEvents = 'auto';
    }
  }

  function hideColorButtons(){
    colorPicker.classList.remove("btn-visible");
    colorPicker.classList.add("btn-hidden");
    for (var i = allColors.length -1; i >= 0; i--) {
      allColors[i].style.pointerEvents = 'none';
    }
  }

  function displayWidth(_tool){
    clearButtonSelection(allWidths, "btn-active");
    customWidth.classList.remove("slider-active");
    if(_tool==1) {
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
        default:
          customWidth.value=lineWidth;
          customWidth.classList.add("slider-active");
          customWidth.setAttribute("data-tooltip","DIMENSIONE: "+customWidth.value+"px");
          break;
      }
    }
    else if(_tool==2) {
      switch(markerWidth){
        case 5:
          smallWidth.classList.add("btn-active");
          break;
        case 10:
          mediumWidth.classList.add("btn-active");
          break;
        case 20:
          bigWidth.classList.add("btn-active");
          break;
        default:
          customWidth.value=markerWidth/5;
          customWidth.classList.add("slider-active");
          customWidth.setAttribute("data-tooltip","DIMENSIONE: "+customWidth.value*5+"px");
          break;
      }
    }
    else if(_tool==3){
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
        default:
          customWidth.value=rubberWidth/15;
          customWidth.classList.add("slider-active");
          customWidth.setAttribute("data-tooltip","DIMENSIONE: "+customWidth.value*15+"px");
          break;
      }
    }
  }

  // 4: MAKE SETTINGS FOR COLOR PICKER
  for (var i = 0; i < $CLASS("btn-toolbar-color").length; i++) {
    var element = $CLASS("btn-toolbar-color")[i];
    element.addEventListener("click", function() {
      sendColor(this.getAttribute("value"));
      clearButtonSelection(allColors, "btn-active");
      this.classList.add("btn-active");
    });
  }

  // 5: MAKE SETTINGS FOR WIDTH
  smallWidth.addEventListener("click", function() {
    sendWidth(1,toolSelected);
    clearButtonSelection(allWidths, "btn-active");
    customWidth.classList.remove("slider-active");
    this.classList.add("btn-active");
  });
  mediumWidth.addEventListener("click", function() {
    sendWidth(2,toolSelected);
    clearButtonSelection(allWidths, "btn-active");
    customWidth.classList.remove("slider-active");
    this.classList.add("btn-active");
  });
  bigWidth.addEventListener("click", function() {
    sendWidth(4,toolSelected);
    clearButtonSelection(allWidths, "btn-active");
    customWidth.classList.remove("slider-active");
    this.classList.add("btn-active");
  });
  customWidth.addEventListener("click", function() {
    this.setAttribute("data-tooltip","DIMENSIONE: "+this.value+"px");
    sendWidth(this.value,toolSelected);
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("slider-active");
  });
  customWidth.addEventListener("input", function() {
    this.setAttribute("data-tooltip","DIMENSIONE: "+this.value+"px");
    sendWidth(this.value,toolSelected);
  });

  // TOOL PICKER
  pencil.addEventListener("click", function(e) {
    showColorButtons();
    selectTool(this);
    displayWidth(1);
  });
  marker.addEventListener("click", function(e) {
    showColorButtons();
    selectTool(this);
    displayWidth(2);
  });
  rubber.addEventListener("click", function(e) {
    hideColorButtons();
    selectTool(this);
    displayWidth(3);
  });
  ruler.addEventListener("click", function(e) {
    selectTool(this);
  });

  function selectTool(_tool){
    if(_tool.id == "ruler"){
      rulerActive = !rulerActive;
      if(rulerActive){
        _tool.classList.add("btn-ruler-active");
      }
      else{
        _tool.classList.remove("btn-ruler-active");
      }
    }
    else{
      clearButtonSelection(allTools, "btn-tool-active");
      _tool.classList.add("btn-tool-active");
    }
    sendTool(_tool.id);
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
  }

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
  // DA RIVEDERE!
  var isOpen = true;
  var liArray = document.getElementById("footer").querySelectorAll("li:not(#toggle_navbar)");

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

  function sendColor(_color){
    ipc.send('send-command', 'canvas', 'setColor', {color: _color});
    pencilColor.style.borderBottom = "12px solid " + _color;
    markerColor.style.background = "rgba("+hexToRgb(_color).join()+",.5)";
  }
  // this sends a JS Object containing the settings of the line
	function sendWidth(_width, _tool){
    ipc.send('send-command', 'canvas', 'setWidth', {width:_width})
  }

  function sendTool(_tool){
    ipc.send('send-command', 'canvas', 'setTool', {tool: _tool});
  }

	ipc.on('send-command', function(e, command, parameters) {
    switch (command) {
      case "updateTools":
        toolSelected=parameters.tool;
        lineWidth=parameters.line;
        markerWidth=parameters.marker;
        rubberWidth=parameters.rubber;
        rulerActive=parameters.ruler;
        break;
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
      case "displayWidth":
        displayWidth(parameters.tool);
        break;
      default:
        console.log("Unhandled command: " + command);
        break;
    }
  });
});
