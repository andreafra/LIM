var thisFile;

function $ID(__id) {
  return document.getElementById(__id);
}
function $CLASS(__class) {
  return document.getElementsByClassName(__class);
}
document.addEventListener( "DOMContentLoaded", function() {
  //require('electron').remote.getCurrentWindow().toggleDevTools();
  const ipc = require('electron').ipcRenderer;

// function to setup a new canvas for drawing
// Thanks to http://perfectionkills.com/exploring-canvas-drawing-techniques/
// for the nice explanation :)

  //define and resize canvas

  var footer = document.getElementById("footer");
  var canvasWidth = window.innerWidth;
  var canvasHeight = window.innerHeight;

  thisFile = {
    settings: {
      name: "unnamed",
      date: new Date().getTime(),
      canvas: {
        x: canvasWidth,
        y: canvasHeight,
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
  var markerWidth = 6;
  var rubberWidth = 30;
  translate(ctx,0.5,0.5);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  var markerMultiplier=3;
  var rubberMultiplier=15;

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
      if(!isDrawing && (e.which==1 || e.which==2)){
        startDrawing(e, false);
      }
      else{
        moveDrawing(e, false);
      }
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
      if(!isDrawing){
        startDrawing(e, true);
      }
      else{
        moveDrawing(e, true);
      }
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
      endDrawing(e, true);
    }, false);
    canvas.addEventListener("touchleave", function (e) {
      endDrawing(e, true);
    }, false);
  }

  function resizeCanvas(callLoad) {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
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
      var rgbColor=hexToRgb(lineColor);
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

    if(toolSelected===3){
      clearCircle(ctx,_x,_y,rubberWidth/2);
    }

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

    //SE GOMMA
    if (_line.tool === 3) {
      clearCircle(ctx,_x,_y,_line.width/2);
    }
    else{
      ctx.strokeStyle = _line.color;
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
    }
    //loadIntoCanvas(thisFile,currentPage);
  }
  function endDrawing(e, touch) {
    if(!isDrawing) return;
    //These points are already saved in startDrawing. No need to save here.
    var _lines = thisFile.pages[currentPage].lines;
    var _line = _lines[_lines.length-1]
    var _points = _line.points;

    if(_line.tool !== 3 && _points.length===1){
      var _x=_points[0].x;
      var _y=_points[0].y;
      ctx.beginPath();
      ctx.arc(_x, _y, _line.width/2, 0, 2 * Math.PI, false);
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

  // THESE SET THINGS
  function setColor(color){
    lineColor = color;
  }
  function setWidth(width) {
    switch(toolSelected)
    {
      case 1: lineWidth=width*1; break;
      case 2: markerWidth=width*markerMultiplier; break;
      case 3: rubberWidth=width*rubberMultiplier; break;
    }
  }

  function selectTool(_tool){ //--da dividere
    if(_tool == "ruler"){
      rulerActive = !rulerActive;
      var rulerContainer = $ID("ruler_container");
      if(rulerActive){
        rulerContainer.style.display="flex";
      }
      else{
        rulerContainer.style.display="none";
      }
    }
    else{
      switch(_tool){
        case "pencil": toolSelected=1; break;
        case "marker": toolSelected=2; break;
        case "rubber": toolSelected=3; break;
      }
      //ipc.send('send-command','toolbar','displayWidth',{tool:_tool});
    }
    updateToolbar(); 
  }

  // RECEIVE SETTINGS

  ipc.on('send-command', function(e, command, parameters) {
    switch (command) {
      case "setColor":
        setColor(parameters.color);
        break;
      case "setWidth":
        setWidth(parameters.width);
        break;
      case "setTool":
        selectTool(parameters.tool);
        break;
      case "undo":
        undo();
        break;
      case "redo":
        redo();
        break;
      case "clearAll":
        clearAll();
        break;
      default:
      console.log('No valid command sent')
        break;
    }
  });


  // ==================================================================== //
  //                    O T H E R   F U N C T I O N S                     //
  // ==================================================================== //

  function loadIntoCanvas(file, page){ /*page is optional. if not set, page will be 0*/
    if (file !== null && file !== undefined) {
      console.log("loading file " + file.settings.name);
      thisFile = file;
      ctx.clearRect(0,0,canvas.width,canvas.height);

      if (page === undefined || page === null) {
        page = 0;
      }

      currentPage = page;

      if (thisFile.pages[currentPage] === undefined) {
        thisFile.pages[currentPage] = {lines: [], backstack: []};
      }

      resizeCanvas(false);
      resetBackstackButtons();

      canvas.style.backgroundColor = thisFile.settings.canvas.backgroundColor;
      canvas.style.backgroundImage = thisFile.settings.canvas.backgroundImage;

      //DRAW
      var _lines = thisFile.pages[currentPage].lines;

      for (var line = 0; line < _lines.length; line++) {
        var _line = _lines[line];
        var _points = _line.points;
        if(_line.tool===3){
          for(var i=0; i<=_points.length-1;i++){
            var _x=_points[i].x;
            var _y=_points[i].y;
            clearCircle(ctx,_x,_y,_line.width/2);
          }
        }
        else{
          ctx.fillStyle = _line.color;
          ctx.strokeStyle = _line.color;
          ctx.lineWidth = _line.width;

          if(_points.length===1){
            var _x=_points[0].x;
            var _y=_points[0].y;
            ctx.beginPath();
            ctx.arc(_x, _y, _line.width/2, 0, 2 * Math.PI, false);
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
  }

  //RULER
  var rulerLoader = require('./app/js/ruler');
  rulerLoader.LoadRuler();

  //UNDO & REDO
  var backstack_counter=0;
  var redo_times = 1;
  //On load
  resetBackstackButtons();

  function undo(){
    if(thisFile.pages[currentPage] === undefined) return;
    var _lines = thisFile.pages[currentPage].lines;
    if(_lines.length === 0) return;
    thisFile.pages[currentPage].backstack.push(_lines.pop());
    backstack_counter++;
    redo_times=1;
    loadIntoCanvas(thisFile,currentPage);
  }

  function redo(){
    if(thisFile.pages[currentPage] === undefined) return;
    var _backstack = thisFile.pages[currentPage].backstack;
    if (_backstack.length === 0) return;
    for(var i=0; i<redo_times; redo_times--){
      thisFile.pages[currentPage].lines.push(_backstack.pop());
      backstack_counter--;
    }
    redo_times=1;
    loadIntoCanvas(thisFile,currentPage);
  }

  // CLEAR ALL

  function clearAll(){
    var _lines = thisFile.pages[currentPage].lines;
    redo_times=0; //was most likely 1 before, so let's set it to 0 before increasing it
    for (var i = _lines.length - 1; i >= 0; i--) {
      thisFile.pages[currentPage].backstack.push(_lines.pop());
      redo_times++; //Next redo will redraw every line deleted by clear all
      backstack_counter++;
    };
    loadIntoCanvas(thisFile, currentPage);
  }

  function resetBackstackButtons() {
    var _lines = thisFile.pages[currentPage].lines;
    var _backstack = thisFile.pages[currentPage].backstack;

    ipc.send('send-command', 'toolbar', 'updateBackstackButtons', {
      redo: _backstack.length==0,
      undo: _lines.length==0
    });
  }

  function updateToolbar(){
    ipc.send('send-command', 'toolbar', 'updateTools', {
      tool: toolSelected,
      line: lineWidth,
      marker: markerWidth,
      rubber: rubberWidth,
      ruler: rulerActive
    });
  }

  function translate(context,x,y){
    return;
    context.resetTransform();
    context.translate(x,y);
  }
  
}); // document.ready?