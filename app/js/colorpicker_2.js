(function(){
var CPCanvas = document.getElementById('color_picker_canvas');
var CPCtx = CPCanvas.getContext('2d');
// create an image object and get it’s source
var img = new Image();
img.src = 'app/img/spectrum.png';

// copy the image to the CPCanvas
img.addEventListener("load", function(){
    CPCtx.drawImage(img,0,0,120,70);
});

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

var eyedropper = document.getElementById("color-picker-circle");

function pickColor(event, callback) {
    // getting user coordinates
    //var x = event.clientX - CPCanvas.offsetLeft;
    //var y = event.clientY - (CPCanvas.offsetTop + window.innerHeight - 80);
    var rect = CPCanvas.getBoundingClientRect();
    var x = Math.ceil(event.clientX - rect.left);
    var y = Math.ceil(event.clientY - rect.top);
    // getting image data and RGB values
    var img_data = CPCtx.getImageData((x===0)?x:(x-1), (y===0)?y:(y-1), 1, 1).data;
    var R = img_data[0];
    var G = img_data[1];
    var B = img_data[2];  
    // convert RGB to HEX
    var hex = rgbToHex(R,G,B);
    // making the color the value of the input
    CPCanvas.setAttribute("value", hex);

    // move the eyedropper
    eyedropper.style.display="block";
    eyedropper.style.marginLeft = (x)+"px";
    eyedropper.style.marginTop = (y)+"px";
    eyedropper.style.backgroundColor = hex;

    if(callback) callback();
}
var isPicking = false;


CPCanvas.addEventListener("mousedown", function(event){
    isPicking = true;
});
CPCanvas.addEventListener("mousemove", function(event){
    if(isPicking) {
        pickColor(event, function(){ eyedropper.classList.remove('transition'); });
    }
});
CPCanvas.addEventListener("mouseup", function(event){
    isPicking = false;
    pickColor(event, function(){ eyedropper.classList.add('transition'); });
});


})();