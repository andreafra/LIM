document.addEventListener( "DOMContentLoaded", function() {

	const ipc = require('electron').ipcRenderer;
	ipc.on('doStuff', doStuff);
	//GOOD LUCK WITH IT.

	function doStuff(){
		console.log("haHAA");
	}
});