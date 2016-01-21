document.addEventListener( "DOMContentLoaded", function() {

// function to setup a new canvas for drawing
// Thanks to http://perfectionkills.com/exploring-canvas-drawing-techniques/
// for the nice explanation :)
  //define and resize canvas

  var thisFile = {
    settings: {
      name: "text",
      date: "date",
      canvas: {
        x: 10,
        y: 20,
        background: "#fff"
      }
    },
    pages: [
      {lines: [ ]}
    ]
    // pages: [
    //   lines: [
    //     {points: [{x:0,y:0}],
    //      color: "#fff"}
    // ]
  }

  var content = document.getElementById("content");
  var header_height = document.getElementById('header').clientHeight;

  content.style.height = String(window.innerHeight - header_height) + "px";

  var canvasToAdd = '<canvas id="canvas" width="'+window.innerWidth+'" height="'+(window.innerHeight)+'"></canvas>';
  document.getElementById("content").innerHTML = canvasToAdd;

  var canvas = document.getElementById("canvas");

  var DrawPaddingX = canvas.offsetLeft;
  var DrawPaddingY = canvas.offsetTop;

  var ctx = canvas.getContext('2d');

  window.onresize = function() {
    DrawPaddingX = canvas.offsetLeft;
    DrawPaddingY = canvas.offsetTop;
  }


  function midPointBtw(p1, p2) {
    return {
      x: p1.x + (p2.x - p1.x) / 2,
      y: p1.y + (p2.y - p1.y) / 2
    };
  }

  // Fixed Line Properties
  ctx.lineWidth = 3;
  ctx.shadowBlur = 0.5;
  ctx.imageSmoothingEnabled = true;
  //ctx.translate(0.5,0.5);

  var lineColor = "black";


  var isDrawing, pages = [ ];

  // The current page in the pages[]
  var currentPage = 0;


  function startDrawing(e, touch) {
    isDrawing = true;
    var _x, _y, _points = [ ];
    if (touch) {
      _x = e.changedTouchs[0].clientX - DrawPaddingX;
      _y = e.changedTouchs[0].clientY - DrawPaddingY;
    } else {
      _x = e.clientX - DrawPaddingX;
      _y = e.clientY - DrawPaddingY;
    }
    // save points
    _points.push({ x: _x, y: _y });
    thisFile.pages[0].lines.push({
      points: _points,
      color: ctx.strokeStyle
    });
  }
  function moveDrawing(e, touch) {
    if (!isDrawing) return;

    var _x, _y;
    var _lines = thisFile.pages[0].lines
    var _points = _lines[_lines.length-1].points
    if (touch) {
      canvas.style.cursor = "none";
      _x = e.changedTouchs[0].clientX - DrawPaddingX;
      _y = e.changedTouchs[0].clientY - DrawPaddingY;
    } else {
      canvas.style.cursor = "crosshair";
      _x = e.clientX - DrawPaddingX;
      _y = e.clientY - DrawPaddingY;
    }
    // save points
    _points.push({ x: _x, y: _y });
    //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    var p1 = _points[0];
    var p2 = _points[1];

    ctx.strokeStyle = lineColor;
    ctx.shadowColor = lineColor;
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
  function endDrawing() {
    isDrawing = false;
    console.log(thisFile);

  }
  canvas.onmousedown = function(e) {
    startDrawing(e, false);
  };

  canvas.onmousemove = function(e) {
    moveDrawing(e, false);
  };

  canvas.onmouseup = function() {
    endDrawing();
  };
  // TOUCH SUPPORT
  canvas.addEventListener("touchstart", function(e) {
    startDrawing(e, true);
  }, 0);

  canvas.addEventListener("touchmove", function(e) {
    moveDrawing(e, true);
  }, 0);

  canvas.addEventListener("touchend", function(e) {
    endDrawing();
  }, 0);

  var pencil = document.getElementById("pencil");
  var pencilSelected = false;

  pencil.addEventListener("click", function(e) {
    pencilSelected = true;
  }, 0);

  var blackColor = document.getElementById("pencil_black");
  var blueColor = document.getElementById("pencil_blue");
  var redColor = document.getElementById("pencil_red");
  var greenColor = document.getElementById("pencil_green");
  var otherColor = document.getElementById("pencil_other");

  blackColor.addEventListener("click", function(e) {
    lineColor = "black";
    console.log("Draw in: "+lineColor);
  }, 0);
  blueColor.addEventListener("click", function(e) {
    lineColor = "#2962ff";
    console.log("Draw in: "+lineColor);
  }, 0);
  redColor.addEventListener("click", function(e) {
    lineColor = "#f44336";
    console.log("Draw in: "+lineColor);
  }, 0);
  greenColor.addEventListener("click", function(e) {
    lineColor = "#4caf50";
    console.log("Draw in: "+lineColor);
  }, 0);
}, false ); // document.ready?
