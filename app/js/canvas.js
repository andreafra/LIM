var thisFile;
exports.thisFile = thisFile;
document.addEventListener( "DOMContentLoaded", function() {

// function to setup a new canvas for drawing
// Thanks to http://perfectionkills.com/exploring-canvas-drawing-techniques/
// for the nice explanation :)
  //define and resize canvas

  var header = document.getElementById("header");
  var footer = document.getElementById("footer");
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
    //      color: "#fff", width: 4, rubber: true}],
    //    backstack: [
    //      {points: [{x:0,y:0}],
    //      color: "#fff", width: 4, rubber: true}]
    // }]
  }

  var content = document.getElementById("content");
  var header_height = document.getElementById('header').clientHeight;
  var title = document.getElementById("title");

  content.style.height = String(window.innerHeight - header_height) + "px";

  var canvasToAdd = '<canvas id="canvas" width="'+canvasWidth+'" height="'+(canvasHeight)+'"></canvas><div id="grid"></div>';
  document.getElementById("content").innerHTML = canvasToAdd;

  var canvas = document.getElementById("canvas");

  canvas.style.backgroundColor = thisFile.settings.canvas.backgroundColor;
  canvas.style.backgroundImage = thisFile.settings.canvas.backgroundImage;

  var DrawPaddingX = canvas.offsetLeft;
  var DrawPaddingY = canvas.offsetTop;

  var ctx = canvas.getContext('2d');

  window.onresize = function() {
    resizeCanvas(true);
  }

  function resizeCanvas(callLoad) {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight - footer.clientHeight - header.clientHeight;
    var oldCanvasWidth = thisFile.settings.canvas.x;
    var oldCanvasHeight = thisFile.settings.canvas.y;
    var widthRatio = canvasWidth/oldCanvasWidth;
    var heightRatio = canvasHeight/oldCanvasHeight;
    if(canvasWidth==oldCanvasWidth && canvasHeight == oldCanvasHeight) {
      console.log("skipping canvas resize");
      return;
    }

    content.style.height = String(window.innerHeight - header_height) + "px";

    canvasToAdd = '<canvas id="canvas" width="'+canvasWidth+'" height="'+(canvasHeight)+'"></canvas><div id="grid"></div>';
    document.getElementById("content").innerHTML = canvasToAdd;
    canvas = document.getElementById("canvas");
    DrawPaddingX = canvas.offsetLeft;
    DrawPaddingY = canvas.offsetTop;
    ctx = canvas.getContext('2d');
    ctx.shadowBlur = 0.5;
    ctx.imageSmoothingEnabled = true;
    ctx.strokeStyle = lineColor;
    ctx.shadowColor = lineColor;
    ctx.lineWidth = lineWidth;
    //Re-bind click events, since we've updated canvas object
    canvas.onmousedown = function(e) {
      startDrawing(e, false);
    };
    canvas.onmousemove = function(e) {
      moveDrawing(e, false);
    };
    canvas.onmouseup = function(e) {
      endDrawing(e, false);
    };
    // TOUCH SUPPORT
    canvas.addEventListener("touchstart", function(e) {
      startDrawing(e, true);
    });

    canvas.addEventListener("touchmove", function(e) {
      moveDrawing(e, true);
    });

    canvas.addEventListener("touchend", function(e) {
      endDrawing();
    });

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

  // Fixed Line Properties
  ctx.shadowBlur = 0.5;
  ctx.imageSmoothingEnabled = true;

  //default values
  var lineColor = "black";
  var lineWidth = 4;
  var rubberWidth = 30;
  ctx.strokeStyle = lineColor;
  ctx.shadowColor = lineColor;
  ctx.lineWidth = lineWidth;
  //ctx.translate(0.5,0.5);

  var toolSelected = "pencil"; // can be "pencil", "rubber"
  var rulerActive = false;

  

  var isDrawing, pages = [ ];
  var hasMoved = false;

  // The current page in the pages[]
  var currentPage = 0;


  function startDrawing(e, touch) {
    console.log("Started drawing!");
    if (toolSelected === "ruler") return;
    isDrawing = true;
    hasMoved = false; //Not yet

    if(thisFile.pages[currentPage] === undefined)
      thisFile.pages[currentPage] = {lines: [], backstack: []};

    var _x, _y, _points = [ ];
    if (touch) {
      _x = e.touches[0].clientX;
      _y = e.touches[0].clientY;
    } else {
      _x = e.clientX;
      _y = e.clientY;
    }

    //RULER ON
    if(rulerActive){

      //let's get the equation for the line that lies on the ruler
      //Using 2 points we can get the general equation for a straight line

      var ruler_topLeft = document.getElementById("top_left");
      var ruler_topRight = document.getElementById("top_right");
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
    }

    //gotta be responsive
    _x-= DrawPaddingX;
    _y-= DrawPaddingY;

    // save points
    _points.push({ x: _x, y: _y });
    if (toolSelected !== "rubber") { // RUBBER OFF
      thisFile.pages[currentPage].lines.push({
        points: _points,
        color: lineColor,
        width: lineWidth,
        rubber: false
      });
    } else { // RUBBER ON
      thisFile.pages[currentPage].lines.push({
        points: _points,
        color: canvas.style.backgroundColor,
        width: rubberWidth,
        rubber: true
      });
    }

    //Delete latest backstacks
    for(var i=0; i < backstack_counter; i++){
      thisFile.pages[currentPage].backstack.pop();
    }
    redo_times=1;
  }

  function moveDrawing(e, touch) {
    if (toolSelected === "ruler") return;
    if (!isDrawing) return;

    hasMoved = true;
    var _x, _y, _points;
    var _lines = thisFile.pages[currentPage].lines;

    _points = _lines[_lines.length-1].points;
    ctx.strokeStyle = ctx.shadowColor = _lines[_lines.length-1].color;
    ctx.lineWidth = _lines[_lines.length-1].width;

    if (toolSelected === "rubber") {
      ctx.shadowColor = "transparent";
    } 
    if (touch) {
      canvas.style.cursor = "none";
      _x = e.changedTouches[0].clientX;
      _y = e.changedTouches[0].clientY;
    } else {
      canvas.style.cursor = "crosshair";
      _x = e.clientX;
      _y = e.clientY;
    }

    //RULER ON
    if(rulerActive){
      //let's get the equation for the line that lies on the ruler
      //Using 2 points we can get the general equation for a straight line

      var ruler_topLeft = document.getElementById("top_left");
      var ruler_topRight = document.getElementById("top_right");
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
    }

    //gotta be responsive
    _x-= DrawPaddingX;
    _y-= DrawPaddingY;

    // save points
    _points.push({ x: _x, y: _y });
    //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    var p1 = _points[0];
    var p2 = _points[1];

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);

    for (var i = 1, len = _points.length; i < len; i++) {
      // we pick the point between pi+1 & pi+2 as the
      // end point and p1 as our control point
      var midPoint = midPointBtw(p1, p2);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      p1 = _points[i];
      p2 = _points[i+1];
    }
    // Draw last line as a straight line while
    // we wait for the next point to be able to calculate
    // the bezier control point
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
  function endDrawing(e, touch) {
    if (toolSelected === "ruler") return;
  	//Handle dots
  	if(!hasMoved && isDrawing) {
  		var _x, _y;
  		if (touch) {
  		  _x = e.changedTouches[0].clientX - DrawPaddingX;
  		  _y = e.changedTouches[0].clientY - DrawPaddingY;
  		} else {
  		  _x = e.clientX - DrawPaddingX;
  		  _y = e.clientY - DrawPaddingY;
  		}
      var _width;
      var _lines = thisFile.pages[currentPage].lines;

  		ctx.beginPath();

      ctx.fillStyle = ctx.strokeStyle = ctx.shadowColor = _lines[_lines.length-1].color;
      _width = _lines[_lines.length-1].width;

  		ctx.arc(_x, _y, _width, 0, 2 * Math.PI, false);
      ctx.fill();
  	}
	
	 //These points are already saved in startDrawing. No need to save here.
    resetBackstackButtons();
    isDrawing = false;
    hasMoved = false;
  }


  canvas.onmousedown = function(e) {
    startDrawing(e, false);
  };

  canvas.onmousemove = function(e) {
    moveDrawing(e, false);
  };

  canvas.onmouseup = function(e) {
    endDrawing(e, false);
  };
  // TOUCH SUPPORT
  canvas.addEventListener("touchstart", function(e) {
    startDrawing(e, true);
  });

  canvas.addEventListener("touchmove", function(e) {
    moveDrawing(e, true);
  });

  canvas.addEventListener("touchend", function(e) {
    endDrawing();
  });

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

  var whiteBackground = document.getElementById("background_white");
  var blackBackground = document.getElementById("background_black");
  var greenBackground = document.getElementById("background_green");
  var customBackground = document.getElementById("background_custom");

  var noneBackground = document.getElementById("background_none");
  var squaredBackground = document.getElementById("background_squared");
  var squaredMarkedBackground = document.getElementById("background_squared_marked");
  var linesBackground = document.getElementById("background_lines");
  var dotsBackground = document.getElementById("background_dots");

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

  function setColor(color){
    lineColor = color;
    pencilColor.style.borderBottom = "12px solid " + lineColor;
  }
  function setWidth(width) {
     lineWidth = width;
     ctx.lineWidth = width;
  }
  function setRubberWidth(width) {
     rubberWidth = width;
     ctx.lineWidth = width;
  }
  function setBackgroundColor(color) {
    thisFile.settings.canvas.backgroundColor = color;
    canvas.style.backgroundColor = thisFile.settings.canvas.backgroundColor;
    loadIntoCanvas(thisFile, currentPage);
  }
  function setBackgroundImage(image) { // NO .PNG
     thisFile.settings.canvas.backgroundImage = "url('app/img/grid/"+image+".png')";
     document.getElementById("grid").style.backgroundImage = thisFile.settings.canvas.backgroundImage;
  }

  function selectTool(_tool){
    if(_tool.id == "ruler"){
      rulerActive = !rulerActive;
      var rulerContainer = document.getElementById("ruler_container");
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
      toolSelected = _tool.id;
    }
  }

  // TOOL PICKER
  pencil.addEventListener("click", function(e) {
    showColorButtons();
    if (toolSelected === "rubber") {
      ctx.strokeStyle = ctx.shadowColor = lineColor;
      ctx.lineWidth = lineWidth;
    }

    selectTool(this);
    ctx.lineWidth = lineWidth;
  });
  rubber.addEventListener("click", function(e) {
    hideColorButtons();
    selectTool(this);
    ctx.lineWidth = rubberWidth;
  });
  ruler.addEventListener("click", function(e) {
    selectTool(this);
    ctx.lineWidth = lineWidth;
  });
  // COLOR PICKER
  blackColor.addEventListener("click", function(e) {
    setColor("black");
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");
  });
  blueColor.addEventListener("click", function(e) {
    setColor("#2962ff");
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");
  });
  redColor.addEventListener("click", function(e) {
    setColor("#f44336");
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");
  });
  greenColor.addEventListener("click", function(e) {
    setColor("#4caf50");
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");
  });
  customColor.addEventListener("mouseup", function() {
    clearButtonSelection(allColors, "btn-active");
    this.classList.add("btn-active");
    document.getElementById("body").lastChild.addEventListener("mouseup", function() {
      setColor(customColor.getAttribute("value"));
    });
  });
  customColor.addEventListener("click", function() {
    //Voglio che il colore venga settato all'ultimo colore scelto quanto clicco
    setColor(customColor.getAttribute("value"));
  });

  // WIDTH
  smallWidth.addEventListener("click", function() {
    if (toolSelected === "rubber") {
      setRubberWidth(15);
    } else {
      setWidth(2);
    }
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");
  });
  mediumWidth.addEventListener("click", function() {
    if (toolSelected === "rubber") {
      setRubberWidth(30);
    } else {
      setWidth(4);
    }
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");
  });
  bigWidth.addEventListener("click", function() {
    if (toolSelected === "rubber") {
      setRubberWidth(60);
    } else {
      setWidth(6);
    }
    clearButtonSelection(allWidths, "btn-active");
    this.classList.add("btn-active");
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
    document.getElementById("body").lastChild.addEventListener("mouseup", function() {
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


  //SAVE
  var saveButton = document.getElementById("save");

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
    document.getElementById("title").innerHTML=thisFile.settings.name.split("\\").pop();
  }

  //LOAD
  var loadButton = document.getElementById("load");
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
      document.getElementById("grid").style.backgroundImage = thisFile.settings.canvas.backgroundImage;
      title.innerHTML=thisFile.settings.name.split("\\").pop();

      //DRAW
      //When backgruond changes color, i want rubber to be re-colored to match bg color
      for(var i = 0; i < thisFile.pages[currentPage].lines.length; i++) {
        if(thisFile.pages[currentPage].lines[i].rubber)
        {
          thisFile.pages[currentPage].lines[i].color = thisFile.settings.canvas.backgroundColor;
        }
      }
      var _lines = thisFile.pages[currentPage].lines;

      for (var line = 0; line < _lines.length; line++) {
        var _line = _lines[line];
        var _points = _line.points;

        if (_points.length === 1){  //draw a dot
          _x=_points[0].x;
          _y=_points[0].y;
          ctx.beginPath();
          ctx.arc(_x, _y, _line.width, 0, 2 * Math.PI, false);
          ctx.fillStyle = _line.color;
          ctx.shadowColor = _line.color;
          ctx.strokeStyle = _line.color;
          ctx.fill();
        }
        else {  //draw a line

          ctx.shadowBlur = 0.5;
          ctx.imageSmoothingEnabled = true;
          ctx.strokeStyle = _line.color;
          if (_line.rubber) {
            ctx.shadowColor = "transparent";
          } else {
            ctx.shadowColor = _line.color;
          }

          //Adapted code from startDrawing
          for(var _point = 1; _point<_points.length;_point++){ //Simulate i'm drawing
            var p1 = _points[0];
            var p2 = _points[1];

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);

            for (var i = 1; i < _point+1; i++) {  //Will produce the same effect as _points.length in startDrawing
              // we pick the point between pi+1 & pi+2 as the
              // end point and p1 as our control point
              var midPoint = midPointBtw(p1, p2);
              ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
              p1 = _points[i];
              p2 = _points[i+1];
            }
            // Draw last line as a straight line while
            // we wait for the next point to be able to calculate
            // the bezier control point
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
        }
      }     
    } else console.log("error loading file: " + file);
  }

  //RULER
  var rulerLoader = require('./app/js/ruler');
  rulerLoader.LoadRuler();

  //UNDO & REDO
  var undo = document.getElementById("undo");
  var redo = document.getElementById("redo");
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

  var clearAllBtn = document.getElementById("clear_all")
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

  var pageCounter = document.getElementById("page_counter");
  var pageNextBtn = document.getElementById("page_next");
  var pagePrevBtn = document.getElementById("page_prev");

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