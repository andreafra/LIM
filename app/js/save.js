var dialog;
var app;
if(require('electron').remote == undefined) //calling from main
{
  dialog = require('dialog');
  app = require('app');
}
else{
  dialog = require('electron').remote.require('dialog');
  app = require('electron').remote.require('app');
}

// SAVE AS (1st time)
exports.SaveAs = function(thisFile, callback) {
  var fs = require('fs'); 
  dialog.showSaveDialog({ 
    filters: [ { name: 'lim', extensions: ['lim'] } ]
  }, function(fileName) {
    if(fileName === undefined) return;
    thisFile.settings.name = fileName;
    fs.writeFile(fileName, JSON.stringify(thisFile), function (err) {
      if(err!=null) {
        console.log("Error saving file: " + err);
      }
      else{
        callback(fileName);
      }
    });
  });
}

// SAVE (2nd time)
exports.Save = function(thisFile) {
  var fs = require('fs'); 
  fs.writeFile(thisFile.settings.name,
               JSON.stringify(thisFile),
               function(err) {
    if(err === null) {
      dialog.showMessageBox({ type: 'info', buttons: ['Ok'], message: "File has been saved to Documents folder as " + thisFile.settings.name});
    }
    else console.log("Error saving file: " + err);
  });
}