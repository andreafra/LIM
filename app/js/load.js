const dialog = require('electron').remote.require('dialog');

exports.Load = function(callback) {
	dialog.showOpenDialog
	(
		{ 
			properties : [ 'openFile' ],
			filters: [{ name: 'lim', extensions: ['lim'] }]
		},
		function (fileNames) {
			var fileName = fileNames[0]; //showOpenDialog always returns an array
			var fs = require('fs');
			fs.readFile(fileName, 'utf-8', function(err, data){
				if(err == null){
					var file = JSON.parse(data);
      				document.getElementById('settings_container').classList.add('hidden'); //hide settings menu
					console.log('File parsed');
					callback(file);
				}
				else {
					console.log('Failed to read file');
				}
			});
		}
	);
}