const electron = require('electron');
const ipcMain = require('electron').ipcMain;

const app = electron.app;  // Module to control application life.
var path = require('path');
var cp = require('child_process');
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.

// Report crashes to our server.
electron.crashReporter.start();

// ========= //
// Installer //
// ========= //
var handleStartupEvent = function() {
  if (process.platform !== 'win32') {
    return false;
  }

   function executeSquirrelCommand(args, done) {
      var updateDotExe = path.resolve(path.dirname(process.execPath), 
         '..', 'update.exe');
      var child = cp.spawn(updateDotExe, args, { detached: true });
      child.on('close', function(code) {
         done();
      });
   };

   function install(done) {
      var target = path.basename(process.execPath);
      executeSquirrelCommand(["--createShortcut", target], done);
   };

   function uninstall(done) {
      var target = path.basename(process.execPath);
      executeSquirrelCommand(["--removeShortcut", target], done);
   };

  var squirrelCommand = process.argv[1];
  switch (squirrelCommand) {
    case '--squirrel-install':
      install();
    case '--squirrel-updated':

      // Optionally do things such as:
      //
      // - Install desktop and start menu shortcuts
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Always quit when done
      install(app.quit);
      return true;
    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Always quit when done
      uninstall(app.quit());
      return true;
    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit();
      return true;
  }
};

if (handleStartupEvent()) {
  return;
}

// =========== //
// Autoupdater //
// =========== //
var canUpdate = false;
const GhReleases = require('electron-gh-releases')

var options = {
  repo: 'QUB3X/LIM',
  currentVersion: app.getVersion()
}

const updater = new GhReleases(options);

// Check for updates
// `status` returns true if there is a new update available
if(!canUpdate){
  updater.check((err, status) => {
    if (!err && status) {
      // Download the update
      updater.download()
    }
  });
}
else{
  updater.install();
}
// When an update has been downloaded
updater.on('update-downloaded', (info) => {
  // Restart the app and install the update
  dialog.showMessageBox({ type: 'info', buttons: ['Restart', 'Save and restart', 'Not now'], cancelId: 2, message: "An update has been downloaded. Do you want to restart to install it?"},
    function(response) {
      switch(response) {
        case 0:
          updater.install();
        case 1:
          var saveFile = require('./app/js/save');
          saveFile.SaveAs(thisFile,updater.install());
        case 2:
          canUpdate = true;
      }
    });
})

// Access electrons autoUpdater
updater.autoUpdater

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent:false,
    fullscreen:false,
    frame: false,
    minWidth: 800,
    minHeight: 600
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});

ipcMain.on('close-main-window', function () {
  app.quit();
});
ipcMain.on('maximize-main-window', function () {
  if(mainWindow.isMaximized())
    mainWindow.unmaximize();
  else
    mainWindow.maximize();
});
ipcMain.on('minimize-main-window', function () {
  mainWindow.minimize();
});