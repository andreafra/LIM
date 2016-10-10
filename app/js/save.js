var ipc = require('electron').ipcRenderer;
const {dialog} = require('electron').remote;
const {app} = require('electron').remote;

if(require('electron').remote == undefined) //calling from main
{
  const {dialog} = require('electron');
  const {app} = require('electron');
}

// SAVE AS (1st time)
exports.SaveAs = function(thisFile, rename, action) {
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
        rename(fileName);
        switch(action)
        {
          case 'update':
            ipc.send('update');
            break;
          case 'quit':
            app.quit();
            break;
          case 'back-to-main':
            ipc.send('load-menu');
            break;
        }
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
      dialog.showMessageBox({ type: 'info', buttons: ['Ok'], message: "Il file è stato salvato in " + thisFile.settings.name});
    }
    else console.log("Error saving file: " + err);
  });
}