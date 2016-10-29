var thisFile;

function $ID(__id) {
  return document.getElementById(__id);
}
function $CLASS(__class) {
  return document.getElementsByClassName(__class);
}
document.addEventListener( "DOMContentLoaded", function() {

  const ipc = require('electron').ipcRenderer;
  ipc.on('save-file', function(event,arg1){
    var saveFile = require('./app/js/save');
    saveFile.SaveAs(thisFile,rename,arg1);
  });

// function to setup a new canvas for drawing
// Thanks to http://perfectionkills.com/exploring-canvas-drawing-techniques/
// for the nice explanation :)

  //define and resize canvas

  var header = $ID("header");
  var footer = $ID("footer");
  var canvasWidth = window.innerWidth;
  var canvasHeight = window.innerHeight - footer.clientHeight - header.clientHeight;

  thisFile = {
    settings: {
      name: "unnamed",
      date: new Date().getTime(),
      canvas: {
        x: canvasWidth,
        y: canvasHeight,
        backgroundColor: "#fff",
        backgroundImage: "none"
      }
    },
    pages: [
      {lines: [ ],
        backstack: [ ]}
    ]
    // pages: [{
    //   lines: [
    //     {points: [{x:0,y:0}],
    //      color: "#fff", width: 4, tool: 1}],
    //    backstack: [
    //      {points: [{x:0,y:0}],
    //      color: "#fff", width: 4, tool: 1}]
    // }]
  };

  var content = $ID("content");
  var title = $ID("title");

  content.style.height = canvasHeight + "px";

  var canvasToAdd = '<canvas id="canvas" width="'+canvasWidth+'" height="'+canvasHeight+'"></canvas>';
  $ID("content").innerHTML = canvasToAdd;

  var canvas = $ID("canvas");

  canvas.style.cursor = "crosshair";
  canvas.style.backgroundColor = thisFile.settings.canvas.backgroundColor;
  canvas.style.backgroundImage = thisFile.settings.canvas.backgroundImage;

  var DrawPaddingX = canvas.offsetLeft;
  var DrawPaddingY = canvas.offsetTop;

  var ctx = canvas.getContext('2d');

  //default values
  var lineColor = "#000000";
  var lineWidth = 2;
  var markerWidth = 10;
  var rubberWidth = 30;
  translate(ctx,0.5,0.5);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  var toolSelected = 1; //1=pencil, 2=marker, 3=rubber
  var rulerActive = false;

  var isDrawing, pages = [ ];

  // The current page in the pages[]
  var currentPage = 0;

  //FIX FUCKING CHROMIUM BUG
  var ignoreNextMove = false;

  window.onresize = function() {
    resizeCanvas(true);
  }

  function bindEvents(){
    canvas.addEventListener("mousedown", function (e) {
      startDrawing(e, false);
    }, false);
    canvas.addEventListener("mousemove", function (e) {
      //FIX FUCKING CHROMIUM BUG
      if(ignoreNextMove)
      {
          ignoreNextMove = false;
          return;
      }
      moveDrawing(e, false);
    }, false);
    canvas.addEventListener("mouseup", function (e) {
      ignoreNextMove = true;
      endDrawing(e, false);
    }, false);
    // TOUCH SUPPORT
    canvas.addEventListener("touchstart", function (e) {
      startDrawing(e, true);
    }, false);

    canvas.addEventListener("touchmove", function (e) {
      moveDrawing(e, true);
    }, false);

    canvas.addEventListener("touchend", function (e) {
      endDrawing(e, true);
    }, false);
    // Prevent scrolling when touching the canvas
    document.body.addEventListener("touchstart", function (e) {
      if (e.target == canvas) {
        e.preventDefault();
      }
    }, false);
    document.body.addEventListener("touchend", function (e) {
      if (e.target == canvas) {
        e.preventDefault();
      }
    }, false);
    document.body.addEventListener("touchmove", function (e) {
      if (e.target == canvas) {
        e.preventDefault();
      }
    }, false);
    //Stop drawing if cursor leaves canvas
    canvas.addEventListener("mouseleave", function (e) {
      if(isDrawing)
        endDrawing(e, true);
    }, false);
    canvas.addEventListener("touchleave", function (e) {
      endDrawing(e, true);
    }, false);
  }

  function resizeCanvas(callLoad) {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight - footer.clientHeight - header.clientHeight;
    var oldCanvasWidth = thisFile.settings.canvas.x;
    var oldCanvasHeight = thisFile.settings.canvas.y;
    var widthRatio = canvasWidth/oldCanvasWidth;
    var heightRatio = canvasHeight/oldCanvasHeight;
    if(canvasWidth==oldCanvasWidth && canvasHeight == oldCanvasHeight) {
      return;
    }

    content.style.height = canvasHeight + "px";

    canvasToAdd = '<canvas id="canvas" width="'+canvasWidth+'" height="'+canvasHeight+'"></canvas>';
    $ID("content").innerHTML = canvasToAdd;
    canvas = $ID("canvas");
    canvas.style.cursor = "crosshair";

    DrawPaddingX = canvas.offsetLeft;
    DrawPaddingY = canvas.offsetTop;
    ctx = canvas.getContext('2d');
    translate(ctx,0.5,0.5);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    //Re-bind click events, since we've updated canvas object
    bindEvents();

    //Adapt points
    for(var i=0; i<thisFile.pages.length; i++){
      var _lines = thisFile.pages[i].lines;
      var _backstack = thisFile.pages[i].backstack;
      //lines
      for(var j=0; j<_lines.length; j++){
        var _points = _lines[j].points;
        for(var k=0; k<_points.length; k++){
          var _point = _points[k];
          var newPointX = _point.x * widthRatio;
          var newPointY = _point.y * heightRatio;
          thisFile.pages[i].lines[j].points[k]={x:newPointX,y:newPointY};
        }
      }
      //backstack
      for(var l=0; l<_backstack.length; l++){
        var _points1 = _backstack[l].points;
        for(var m=0; m<_points1.length; m++){
          var _point1 = _points1[m];
          var newPointX = _point1.x * widthRatio;
          var newPointY = _point1.y * heightRatio;
          thisFile.pages[i].backstack[l].points[m]={x:newPointX,y:newPointY};
        }
      }
    }
    thisFile.settings.canvas.x=canvasWidth;
    thisFile.settings.canvas.y=canvasHeight;
    if(callLoad==true){
      loadIntoCanvas(thisFile,currentPage);
    }
  }

  function midPointBtw(p1, p2) {
    return {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2
    };
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
  }

  function startDrawing(e, touch) {
    isDrawing = true;

    canvas.style.cursor="none";

    if(thisFile.pages[currentPage] === undefined)
      thisFile.pages[currentPage] = {lines: [], backstack: []};

    var _x, _y, _points = [ ];
    if (touch) {
      _x = e.changedTouches[0].clientX;
      _y = e.changedTouches[0].clientY;
    } else {
      _x = e.clientX;
      _y = e.clientY;
    }

    //RULER ON
    if(rulerActive){
      var newPoint = getPointOnRuler(_x,_y);
      _x=newPoint.x;
      _y=newPoint.y;
    }

    //gotta be responsive
    _x-= DrawPaddingX;
    _y-= DrawPaddingY;

    //Set transparency
    _color_to_use=lineColor;
    if(toolSelected===2){
      rgbColor=hexToRgb(lineColor);
      _color_to_use="rgba("+rgbColor.join()+",.5)";
    }

    // save points
    _points.push({ x: _x, y: _y });
    thisFile.pages[currentPage].lines.push({
      points: _points,
      color: _color_to_use,
      width: (toolSelected===3) ? rubberWidth : ((toolSelected===2) ? markerWidth : lineWidth),
      tool: toolSelected
    });

    //Delete latest backstacks
    for(var i=0; i < backstack_counter; i++){
      thisFile.pages[currentPage].backstack.pop();
    }
    redo_times=1;

    //loadIntoCanvas(thisFile,currentPage);
  }
  function moveDrawing(e, touch) {
    if (!isDrawing) {
      canvas.style.cursor="crosshair";
      return;
    }

    var _x, _y;
    var _lines = thisFile.pages[currentPage].lines;
    var _line = _lines[_lines.length-1]
    var _points = _line.points;

    if (touch) {
      _x = e.changedTouches[0].clientX;
      _y = e.changedTouches[0].clientY;
    } else {
      _x = e.clientX;
      _y = e.clientY;
    }

    //RULER ON
    if(rulerActive){
      //let's get the equation for the line that lies on the ruler
      //Using 2 points we can get the general equation for a straight line
      var newPoint = getPointOnRuler(_x,_y);
      _x=newPoint.x;
      _y=newPoint.y;
    }

    //gotta be responsive
    _x-= DrawPaddingX;
    _y-= DrawPaddingY;

    // save points
    _points.push({ x: _x, y: _y });

    ctx.strokeStyle = (_line.tool===3) ? ctx.strokeStyle=thisFile.settings.canvas.backgroundColor : _line.color;
    ctx.lineWidth = _line.width;

    var p1 = _points[_points.length-3];
    var p2 = _points[_points.length-2];
    var p3 = _points[_points.length-1];
    if(!p1) p1=p2;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.stroke();

    //loadIntoCanvas(thisFile,currentPage);
  }
  function endDrawing(e, touch) {
    //These points are already saved in startDrawing. No need to save here.
    var _lines = thisFile.pages[currentPage].lines;
    var _line = _lines[_lines.length-1]
    var _points = _line.points;

    if(_points.length===1){
      var _x=_points[0].x;
      var _y=_points[0].y;
      ctx.beginPath();
      ctx.arc(_x, _y, _line.width/1.5, 0, 2 * Math.PI, false);
      ctx.fill();
    }

    resetBackstackButtons();
    isDrawing = false;

    if(_line.tool===2)
      loadIntoCanvas(thisFile,currentPage);
  }

  function getPointOnRuler(_x,_y){
    var ruler_topLeft = $ID("top_left");
    var ruler_topRight = $ID("top_right");
    var _topLeftRect = ruler_topLeft.getBoundingClientRect();
    var _topRightRect = ruler_topRight.getBoundingClientRect();
    var _x1 = _topLeftRect.left;
    var _y1 = _topLeftRect.top;
    var _x2 = _topRightRect.right;
    var _y2 = _topRightRect.top;

    //get a b c
    var a = _y1-_y2;
    var b = _x2-_x1;
    var c = (_x1-_x2)*_y1 + (_y2-_y1)*_x1;

    if(a==0 || b==0){
      if(a==0){
         console.log("a is 0");
         _y=_topLeftRect.top;
      }
      if(b==0){
        console.log("b is 0");
        _x=_topLeftRect.left;
      }
    }
    else{
      //get m and q for the line and its perpendicular passing through input position
      var m1=-a/b;
      var m2=b/a;
      var q1=-c/b;
      var q2=_y - (b/a)*_x;

      //get the point generated by the intersection of the 2 lines
      _x=(q2-q1)/(m1-m2);
      _y=-(a/b)*_x - (c/b);
    }
    return {x:_x,y:_y};
  }

  function clearCircle(context,x,y,radius) {
    context.save();
    context.beginPath();
    context.arc(x, y, radius, 0, 2*Math.PI, true);
    context.clip();
    context.clearRect(x-radius,y-radius,radius*2,radius*2);
    context.restore();
  }


  bindEvents();

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

  var whiteBackground = $ID("background_white");
  var blackBackground = $ID("background_black");
  var greenBackground = $ID("background_green");
  var customBackground = $ID("background_custom");

  var noneBackground = $ID("background_none");
  var squaredBackground = $ID("background_squared");
  var squaredMarkedBackground = $ID("background_squared_marked");
  var linesBackground = $ID("background_lines");
  var dotsBackground = $ID("background_dots");

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

  function setColor(color){
    lineColor = color;
    pencilColor.style.borderBottom = "12px solid " + lineColor;
    markerColor.style.background = "rgba("+hexToRgb(lineColor).join()+",.5)";

  }
  function setWidth(width,tool) {
    switch(tool)
    {
      case 1: lineWidth=width; break;
      case 2: markerWidth=width*5; break;
      case 3: rubberWidth=width*15; break;
    }
  }
  function setBackgroundColor(color) {
    thisFile.settings.canvas.backgroundColor = color;
    loadIntoCanvas(thisFile,currentPage);
  }
  function setBackgroundImage(image) { // NO .PNG
    thisFile.settings.canvas.backgroundImage = "url('app/img/grid/"+image+".png')";
    loadIntoCanvas(thisFile,currentPage);
  }

  function selectTool(_tool){
    if(_tool.id == "ruler"){
      rulerActive = !rulerActive;
      var rulerContainer = $ID("ruler_container");
      if(rulerActive){
        rulerContainer.style.display="flex";
        _tool.classList.add("btn-ruler-active");
      }
      else{
        rulerContainer.style.display="none";
        _tool.classList.remove("btn-ruler-active");
      }
    }
    else{
      clearButtonSelection(allTools, "btn-tool-active");
      _tool.classList.add("btn-tool-active");
      switch(_tool.id){
        case "pencil": toolSelected=1; break;
        case "marker": toolSelected=2; break;
        case "rubber": toolSelected=3; break;
      }
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


  // COLOR PICKER

  for (var i = 0; i < $CLASS("btn-toolbar-color").length; i++) {
    var element = $CLASS("btn-toolbar-color")[i];
    element.addEventListener("click", function() {
      setColor(this.getAttribute("value"));
      clearButtonSelection(allColors, "btn-active");
      this.classList.add("btn-active");
    });
  }

  /*
  customColor.addEventListener("mouseup", function() {
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");
    $ID("body").lastChild.addEventListener("mouseup", function() {
      setColor(customColor.getAttribute("value"));
    });
  });
  customColor.addEventListener("click", function() {
    //Voglio che il colore venga settato all'ultimo colore scelto quanto clicco
    setColor(customColor.getAttribute("value"));
  });
  */

  // WIDTH
  smallWidth.addEventListener("click", function() {
    setWidth(1,toolSelected);
    clearButtonSelection(allWidths, "btn-active");
    customWidth.classList.remove("slider-active");
    this.classList.add("btn-active");
  });
  mediumWidth.addEventListener("click", function() {
    setWidth(2,toolSelected);
    clearButtonSelection(allWidths, "btn-active");
    customWidth.classList.remove("slider-active");
    this.classList.add("btn-active");
  });
  bigWidth.addEventListener("click", function() {
    setWidth(4,toolSelected);
    clearButtonSelection(allWidths, "btn-active");
    customWidth.classList.remove("slider-active");
    this.classList.add("btn-active");
  });
  customWidth.addEventListener("click", function() {
    this.setAttribute("data-tooltip","DIMENSIONE: "+this.value+"px");
    setWidth(this.value,toolSelected);
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("slider-active");
  });
  customWidth.addEventListener("input", function() {
    this.setAttribute("data-tooltip","DIMENSIONE: "+this.value+"px");
    setWidth(this.value,toolSelected);
  });
  // BACKGROUND COLOR PICKER
  whiteBackground.addEventListener("click", function(e) {
    setBackgroundColor("#ffffff");
  });
  blackBackground.addEventListener("click", function(e) {
    setBackgroundColor("#000000");
  });
  greenBackground.addEventListener("click", function(e) {
    setBackgroundColor("#567E3A");
  });
  customBackground.addEventListener("mouseup", function() {
    $ID("body").lastChild.addEventListener("mouseup", function() {
      setBackgroundColor(customBackground.getAttribute("value"));
    });
  });
  customBackground.addEventListener("click", function() {
    //Voglio che il colore venga settato all'ultimo colore scelto quanto clicco
    setBackgroundColor(customBackground.getAttribute("value"));
  });

  function isDark (color) {
    var c = color.substring(1);      // strip #
    var rgb = parseInt(c, 16);   // convert rrggbb to decimal
    var r = (rgb >> 16) & 0xff;  // extract red
    var g = (rgb >>  8) & 0xff;  // extract green
    var b = (rgb >>  0) & 0xff;  // extract blue

    var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    if (luma > 40) {
      return true;
    } else {
      return false;
    }
  }

  noneBackground.addEventListener("click", function() {
    setBackgroundImage("none");
  });
  squaredBackground.addEventListener("click", function() {
    if(isDark(canvas.style.backgroundColor)) {
      setBackgroundImage("squared-light");
    } else {
      setBackgroundImage("squared-dark");
    }
    console.log(canvas.style.backgroundColor)
    console.log(isDark(canvas.style.backgroundColor))
  });
  squaredMarkedBackground.addEventListener("click", function() {
    if(isDark(canvas.style.backgroundColor)) {
      setBackgroundImage("squared-marked-light");
    } else {
      setBackgroundImage("squared-marked-dark");
    }
  });
  linesBackground.addEventListener("click", function() {
    if(isDark(canvas.style.backgroundColor)) {
      setBackgroundImage("lines-light");
    } else {
      setBackgroundImage("lines-dark");
    }
  });
  dotsBackground.addEventListener("click", function() {
    if(isDark(canvas.style.backgroundColor)) {
      setBackgroundImage("dots-light");
    } else {
      setBackgroundImage("dots-dark");
    }
  });

  function translate(context,x,y){
    return;
    context.resetTransform();
    context.translate(x,y);
  }

  //SAVE
  var saveButton = $ID("save");

  var saveFile = require('./app/js/save');

  saveButton.addEventListener("click", function() {
    if (thisFile.settings.name=="unnamed") {
      saveFile.SaveAs(thisFile, rename);
      console.log('saved as!')
    } else {
      saveFile.Save(thisFile);
      console.log('saved!')
    }
  });

  function rename(fileName){
    thisFile.settings.name == fileName;
    $ID("title").innerHTML=thisFile.settings.name.split("\\").pop();
  }

  //LOAD
  var loadButton = $ID("load");
  var loadFile = require('./app/js/load');

  loadButton.addEventListener("click", function(){
    loadFile.Load(loadIntoCanvas);
  });

  function loadIntoCanvas(file, page){ /*page is optional. if not set, page will be 0*/
    if (file !== null && file !== undefined) {
      console.log("loading file " + file.settings.name);
      thisFile = file;
      ctx.clearRect(0,0,canvas.width,canvas.height);

      if (page === undefined || page === null) {
        page = 0;
      }

      currentPage = page;
      pageCounter.innerHTML = currentPage+1;

      if (thisFile.pages[currentPage] === undefined) {
        thisFile.pages[currentPage] = {lines: [], backstack: []};
      }

      resizeCanvas(false);
      resetBackstackButtons();
      updateNavButtons();

      canvas.style.backgroundColor = thisFile.settings.canvas.backgroundColor;
      canvas.style.backgroundImage = thisFile.settings.canvas.backgroundImage;
      title.innerHTML=thisFile.settings.name.split("\\").pop();

      //DRAW
      var _lines = thisFile.pages[currentPage].lines;

      for (var line = 0; line < _lines.length; line++) {
        var _line = _lines[line];
        var _points = _line.points;
        ctx.fillStyle = (_line.tool===3) ? thisFile.settings.canvas.backgroundColor : _line.color;
        ctx.strokeStyle = (_line.tool===3) ? thisFile.settings.canvas.backgroundColor : _line.color;
        ctx.lineWidth = _line.width;

        if(_points.length===1){
          var _x=_points[0].x;
          var _y=_points[0].y;
          ctx.beginPath();
          ctx.arc(_x, _y, _line.width/1.5, 0, 2 * Math.PI, false);
          ctx.fill();
        }
        else{
          ctx.beginPath();
          for (var i = 0; i < _points.length-1; i++) {
              var p1 = _points[i];
              var p2 = _points[i+1];

              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            }
          ctx.stroke();
        }
      }
    }
  }

  //RULER
  var rulerLoader = require('./app/js/ruler');
  rulerLoader.LoadRuler();

  //UNDO & REDO
  var undo = $ID("undo");
  var redo = $ID("redo");
  var backstack_counter=0;
  var redo_times = 1;
  //On load
  resetBackstackButtons();

  undo.addEventListener("click",function() {
    if(thisFile.pages[currentPage] === undefined) return;
    var _lines = thisFile.pages[currentPage].lines;
    if(_lines.length === 0) return;
    thisFile.pages[currentPage].backstack.push(_lines.pop());
    backstack_counter++;
    redo_times=1;
    loadIntoCanvas(thisFile,currentPage);
  });

  redo.addEventListener("click",function() {
    if(thisFile.pages[currentPage] === undefined) return;
    var _backstack = thisFile.pages[currentPage].backstack;
    if (_backstack.length === 0) return;
    for(var i=0; i<redo_times; redo_times--){
      thisFile.pages[currentPage].lines.push(_backstack.pop());
      backstack_counter--;
    }
    redo_times=1;
    loadIntoCanvas(thisFile,currentPage);
  });

  // CLEAR ALL

  var clearAllBtn = $ID("clear_all")
  clearAllBtn.addEventListener("mousedown", function() {
    var _lines = thisFile.pages[currentPage].lines;
    redo_times=0; //was most likely 1 before, so let's set it to 0 before increasing it
    for (var i = _lines.length - 1; i >= 0; i--) {
      thisFile.pages[currentPage].backstack.push(_lines.pop());
      redo_times++; //Next redo will redraw every line deleted by clear all
      backstack_counter++;
    };
    loadIntoCanvas(thisFile, currentPage);
  });

  function resetBackstackButtons() {
    if(thisFile.pages[currentPage] === undefined){
      undo.style.pointerEvents = 'none';
      redo.style.pointerEvents = 'none';
    }
    else{
      var _lines = thisFile.pages[currentPage].lines;
      var _backstack = thisFile.pages[currentPage].backstack;
      if(_backstack.length==0){
        redo.style.pointerEvents = 'none';
        redo.classList.add("btn-disabled");
      }
      else{
        redo.style.pointerEvents = 'auto';
        redo.classList.remove("btn-disabled");
      }

      if(_lines.length==0){
        undo.style.pointerEvents = 'none';
        undo.classList.add("btn-disabled");
      }
      else{
        undo.style.pointerEvents = 'auto';
        undo.classList.remove("btn-disabled");
      }
    }
  }

  //PAGES

  var pageCounter = $ID("page_counter");
  var pageNextBtn = $ID("page_next");
  var pagePrevBtn = $ID("page_prev");

  function pageNext(){
    loadIntoCanvas(thisFile,currentPage+1);
  }

  function pagePrev(){
    loadIntoCanvas(thisFile,currentPage-1);
  }

  function setPage(_page){
    loadIntoCanvas(thisFile,_page);
  }

  pageNextBtn.addEventListener("click", function(){
    pageNext();
    updateNavButtons();
  });
  pagePrevBtn.addEventListener("click",function(){
    if(currentPage>0) {
      pagePrev();
      updateNavButtons();
    }
  });

  function updateNavButtons() {
    if (currentPage === 0) { // we cant go back to prev page
      pagePrevBtn.classList.add("btn-disabled");
      pagePrevBtn.style.pointerEvents = 'none';
    } else {
      pagePrevBtn.classList.remove("btn-disabled");
      pagePrevBtn.style.pointerEvents = 'auto';
    }
    if ((currentPage + 1) === thisFile.pages.length) { // + replaces -> when there are no more pages
      pageNextBtn.children[0].innerHTML = "note_add";
    } else {
      pageNextBtn.children[0].innerHTML = "arrow_forward";
    }
  }
  // Run once at start
  updateNavButtons();

}); // document.ready?
