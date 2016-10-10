function midPointBtw(p1, p2) {
  return {
    x: p1.x + (p2.x - p1.x) / 2,
    y: p1.y + (p2.y - p1.y) / 2
  };
}

exports.LoadRuler = function(){
  var ruler = document.getElementById("ruler_container");
  var ruler_left = document.getElementById("ruler_left");
  var ruler_right = document.getElementById("ruler_right");
  var ruler_topRight = document.getElementById("top_right");
  var ruler_topLeft = document.getElementById("top_left");
  var ruler_bottomRight = document.getElementById("bottom_right");
  var ruler_center = document.getElementById("ruler_center");
  var ruler_text = document.getElementById("ruler_degrees");

  var mRotation = 0 //default value. musth match css
  var displayRotation = mRotation;
  var startingRotation = 0;

  //Mouse rotation
  var rotation_down = false;
  ruler_right.addEventListener("mousedown", function(event){
    rotation_down = true;
    if(!rotation_down) return;
    var _topLeftRect = ruler_topLeft.getBoundingClientRect();
    var _bottomRightRect = ruler_bottomRight.getBoundingClientRect();
    var _center = midPointBtw(
                            {
                              x: _topLeftRect.left,
                              y: _topLeftRect.top
                            },

                            {
                              x: _bottomRightRect.right,
                              y: _bottomRightRect.bottom
                            }
                          );

    var curTransform = new   WebKitCSSMatrix(window.getComputedStyle(ruler_container).webkitTransform);
    var transformX = curTransform.m41;
    var transformY = curTransform.m42;
    
    startingRotation = Math.atan2(event.clientY - _center.y,
                              event.clientX - _center.x) * 180 / Math.PI;
  });

  ruler_right.addEventListener("mouseup", function(){rotation_down = false;});
  ruler_right.addEventListener("mouseleave", function(){rotation_down = false;});
  ruler_right.addEventListener("mousemove", function(event) {
    if(!rotation_down) return;
    var _topLeftRect = ruler_topLeft.getBoundingClientRect();
    var _bottomRightRect = ruler_bottomRight.getBoundingClientRect();
    var _center = midPointBtw(
                            {
                              x: _topLeftRect.left,
                              y: _topLeftRect.top
                            },

                            {
                              x: _bottomRightRect.right,
                              y: _bottomRightRect.bottom
                            }
                          );

    var curTransform = new   WebKitCSSMatrix(window.getComputedStyle(ruler_container).webkitTransform);
    var transformX = curTransform.m41;
    var transformY = curTransform.m42;
    
    var newRotation = Math.atan2(event.clientY - _center.y,
                              event.clientX - _center.x) * 180 / Math.PI;
    var deltaRotation = newRotation-startingRotation;
    mRotation += deltaRotation;
    startingRotation += deltaRotation;
    ruler.style.transform = "translate("+transformX+"px,"+transformY+"px) rotate(" + mRotation + "deg)";
    if(mRotation >= 0) displayRotation=mRotation|0;
    else displayRotation = (360+mRotation)|0;
    ruler_text.innerHTML=(displayRotation|0) +"°";
  });

  ruler_left.addEventListener("mousedown", function(){
    rotation_down = true;
    var _topLeftRect = ruler_topLeft.getBoundingClientRect();
    var _bottomRightRect = ruler_bottomRight.getBoundingClientRect();
    var _center = midPointBtw(
                            {
                              x: _topLeftRect.left,
                              y: _topLeftRect.top
                            },

                            {
                              x: _bottomRightRect.right,
                              y: _bottomRightRect.bottom
                            }
                          );

    var curTransform = new   WebKitCSSMatrix(window.getComputedStyle(ruler_container).webkitTransform);
    var transformX = curTransform.m41;
    var transformY = curTransform.m42;
    
    startingRotation = Math.atan2(_center.y - event.clientY,
                                  _center.x - event.clientX) * 180 / Math.PI;
  });
  ruler_left.addEventListener("mouseup", function(){rotation_down = false;});
  ruler_left.addEventListener("mouseleave", function(){rotation_down = false;});
  ruler_left.addEventListener("mousemove", function(event) {
    if(!rotation_down) return;
    var _topLeftRect = ruler_topLeft.getBoundingClientRect();
    var _bottomRightRect = ruler_bottomRight.getBoundingClientRect();
    var _center = midPointBtw(
                            {
                              x: _topLeftRect.left,
                              y: _topLeftRect.top
                            },

                            {
                              x: _bottomRightRect.right,
                              y: _bottomRightRect.bottom
                            }
                          );

    var curTransform = new   WebKitCSSMatrix(window.getComputedStyle(ruler_container).webkitTransform);
    var transformX = curTransform.m41;
    var transformY = curTransform.m42;
    
    var newRotation = Math.atan2(_center.y - event.clientY,
                                 _center.x - event.clientX) * 180 / Math.PI;

    var deltaRotation = newRotation-startingRotation;
    mRotation += deltaRotation;
    startingRotation += deltaRotation;
    ruler.style.transform = "translate("+transformX+"px,"+transformY+"px) rotate(" + mRotation + "deg)";
    if(mRotation >= 0) displayRotation=mRotation|0;
else displayRotation = (360+mRotation)|0;
ruler_text.innerHTML=(displayRotation|0) +"°";
  });
  
  //Touch rotation
  ruler_right.addEventListener("touchstart", function(event){
    rotation_down = true;
    if(!rotation_down) return;
    var _topLeftRect = ruler_topLeft.getBoundingClientRect();
    var _bottomRightRect = ruler_bottomRight.getBoundingClientRect();
    var _center = midPointBtw(
                            {
                              x: _topLeftRect.left,
                              y: _topLeftRect.top
                            },

                            {
                              x: _bottomRightRect.right,
                              y: _bottomRightRect.bottom
                            }
                          );

    var curTransform = new   WebKitCSSMatrix(window.getComputedStyle(ruler_container).webkitTransform);
    var transformX = curTransform.m41;
    var transformY = curTransform.m42;
    
    startingRotation = Math.atan2(event.touches[0].clientY - _center.y,
                                  event.touches[0].clientX - _center.x) * 180 / Math.PI;
  });
  ruler_right.addEventListener("touchend", function(){rotation_down = false;});
  ruler_right.addEventListener("touchleave", function(){rotation_down = false;});
  ruler_right.addEventListener("touchmove", function(event) {
    var _topLeftRect = ruler_topLeft.getBoundingClientRect();
    var _bottomRightRect = ruler_bottomRight.getBoundingClientRect();
    var _center = midPointBtw(
                            {
                              x: _topLeftRect.left,
                              y: _topLeftRect.top
                            },

                            {
                              x: _bottomRightRect.right,
                              y: _bottomRightRect.bottom
                            }
                          );

    var curTransform = new   WebKitCSSMatrix(window.getComputedStyle(ruler_container).webkitTransform);
    var transformX = curTransform.m41;
    var transformY = curTransform.m42;
    
    var newRotation = Math.atan2(event.touches[0].clientY - _center.y,
                                 event.touches[0].clientX - _center.x) * 180 / Math.PI;

    deltaRotation = newRotation-startingRotation;
    mRotation += deltaRotation;
    startingRotation += deltaRotation;
    ruler.style.transform = "translate("+transformX+"px,"+transformY+"px) rotate(" + mRotation + "deg)";
    if(mRotation >= 0) displayRotation=mRotation|0;
else displayRotation = (360+mRotation)|0;
ruler_text.innerHTML=(displayRotation|0) +"°";
  });
  

  ruler_left.addEventListener("touchstart", function(){
    rotation_down = true;
    var _topLeftRect = ruler_topLeft.getBoundingClientRect();
    var _bottomRightRect = ruler_bottomRight.getBoundingClientRect();
    var _center = midPointBtw(
                            {
                              x: _topLeftRect.left,
                              y: _topLeftRect.top
                            },

                            {
                              x: _bottomRightRect.right,
                              y: _bottomRightRect.bottom
                            }
                          );

    var curTransform = new   WebKitCSSMatrix(window.getComputedStyle(ruler_container).webkitTransform);
    var transformX = curTransform.m41;
    var transformY = curTransform.m42;
    
    startingRotation = Math.atan2(_center.y - event.touches[0].clientY,
                                  _center.x - event.touches[0].clientX) * 180 / Math.PI;
  });
  ruler_left.addEventListener("touchend", function(){rotation_down = false;});
  ruler_left.addEventListener("touchleave", function(){rotation_down = false;});
  ruler_left.addEventListener("touchmove", function(event) {
    var _topLeftRect = ruler_topLeft.getBoundingClientRect();
    var _bottomRightRect = ruler_bottomRight.getBoundingClientRect();
    var _center = midPointBtw(
                            {
                              x: _topLeftRect.left,
                              y: _topLeftRect.top
                            },

                            {
                              x: _bottomRightRect.right,
                              y: _bottomRightRect.bottom
                            }
                          );

    var curTransform = new   WebKitCSSMatrix(window.getComputedStyle(ruler_container).webkitTransform);
    var transformX = curTransform.m41;
    var transformY = curTransform.m42;
    
    var newRotation = Math.atan2(_center.y - event.touches[0].clientY,
                              _center.x - event.touches[0].clientX ) * 180 / Math.PI;

    deltaRotation = newRotation-startingRotation;
    mRotation += deltaRotation;
    startingRotation += deltaRotation;
    ruler.style.transform = "translate("+transformX+"px,"+transformY+"px) rotate(" + mRotation + "deg)";
    if(mRotation >= 0) displayRotation=mRotation|0;
else displayRotation = (360+mRotation)|0;
ruler_text.innerHTML=(displayRotation|0) +"°";
  });

  
  var lastTouch;
  //Mouse drag
  var drag_down = false;
  ruler_center.addEventListener("mousedown", function(event){drag_down = true; lastTouch={x: event.clientX, y: event.clientY}});
  ruler_center.addEventListener("mouseup", function(){drag_down = false; lastTouch = undefined});
  ruler_center.addEventListener("mouseleave", function(){drag_down = false; lastTouch = undefined});
  ruler_center.addEventListener("mousemove", function(event) {
    if(!drag_down) return;
    if(lastTouch === undefined) return;

    var deltaX = event.clientX - lastTouch.x;
    var deltaY = event.clientY - lastTouch.y

    lastTouch.x = event.clientX;
    lastTouch.y = event.clientY;

    var curTransform = new   WebKitCSSMatrix(window.getComputedStyle(ruler_container).webkitTransform);
    var transformX = curTransform.m41;
    var transformY = curTransform.m42;

    var _x = transformX + deltaX;
    var _y = transformY + deltaY;
    ruler.style.transform = "translate("+_x+"px,"+_y+"px) rotate(" + mRotation + "deg)";
  });

  //Touch drag
  ruler_center.addEventListener("touchstart", function(event){drag_down = true; lastTouch={x: event.touches[0].clientX, y: event.touches[0].clientY}});
  ruler_center.addEventListener("touchend", function(){drag_down = false; lastTouch = undefined});
  ruler_center.addEventListener("touchleave", function(){drag_down = false; lastTouch = undefined});
  ruler_center.addEventListener("touchmove", function(event) {
    if(!drag_down) return;
    if(lastTouch === undefined) return;

    var deltaX = event.touches[0].clientX - lastTouch.x;
    var deltaY = event.touches[0].clientY - lastTouch.y

    lastTouch.x = event.touches[0].clientX;
    lastTouch.y = event.touches[0].clientY;

    var curTransform = new   WebKitCSSMatrix(window.getComputedStyle(ruler_container).webkitTransform);
    var transformX = curTransform.m41;
    var transformY = curTransform.m42;

    var _x = transformX + deltaX;
    var _y = transformY + deltaY;
    ruler.style.transform = "translate("+_x+"px,"+_y+"px) rotate(" + mRotation + "deg)";
  });
}