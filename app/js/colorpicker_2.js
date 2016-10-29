(function(){
var CPCanvas = document.getElementById('color_picker_canvas');
var CPCtx = CPCanvas.getContext('2d');
// create an image object and get it’s source
var img = new Image();
img.src = 'app/img/spectrum.png';

// copy the image to the CPCanvas
img.addEventListener("load", function(){
    CPCtx.drawImage(img,0,0,125,70);
});

function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}

function toHex(n) {
    n = parseInt(n,10);
    if (isNaN(n)) return "00";
    n = Math.max(0,Math.min(n,255));
    return "0123456789ABCDEF".charAt((n-n%16)/16)  + "0123456789ABCDEF".charAt(n%16);
}
var eyedropper = document.getElementById("color-picker-circle");

function pickColor(event) {
    // getting user coordinates
    var x = event.clientX - CPCanvas.offsetLeft;
    var y = event.clientY - (CPCanvas.offsetTop + window.innerHeight - 80);

    console.log("PEPE")
    // getting image data and RGB values
    var img_data = CPCtx.getImageData(x, y, 1, 1).data;
    var R = img_data[0];
    var G = img_data[1];
    var B = img_data[2];  var rgb = R + ',' + G + ',' + B;
    // convert RGB to HEX
    var hex = rgbToHex(R,G,B);
    // making the color the value of the input
    CPCanvas.setAttribute("value", "#"+hex);

    // move the eyedropper
    eyedropper.style.marginLeft = x+"px";
    eyedropper.style.marginTop = y+"px";
    eyedropper.style.backgroundColor = "#"+hex;

}
var isPicking = false;


CPCanvas.addEventListener("mousedown", function(event){
    isPicking = true;
    pickColor(event);
});
CPCanvas.addEventListener("mousemove", function(event){
    if(isPicking) {

        pickColor(event);
    }
});
CPCanvas.addEventListener("mouseup", function(event){
    isPicking = false;
    pickColor(event);
});


})();