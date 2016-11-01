const electron = require('electron');
const ipcMain = require('electron').ipcMain;
const {dialog} = require('electron');
const {app} = require('electron');  // Module to control application life.
var path = require('path');
var cp = require('child_process');
const {BrowserWindow} = require('electron');  // Module to create native browser window.

// Report crashes to our server.
//electron.crashReporter.start();

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
         if(done!==null && done!==undefined)
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
const GhReleases = require('electron-gh-releases')

var options = {
  repo: 'QUB3X/LIM',
  currentVersion: app.getVersion()
}

const updater = new GhReleases(options);

// Check for updates
// `status` returns true if there is a new update available
updater.check((err, status) => {
  if (!err && status) {
    // Download the update
    updater.download()
  }
});

// When an update has been downloaded
updater.on('update-downloaded', (info) => {
  // Restart the app and install the update
  if(mainWindow != null && mainWindow.webContents.getURL().indexOf('paper.html')>-1){
    dialog.showMessageBox({ type: 'info', buttons: ['Riavvia', 'Salva e riavvia', 'Non ora'], cancelId: 2, message: "E' stato scaricato un aggiornamento. Vuoi riavviare il programma per installarlo?"},
    function(response) {
      switch(response) {
        case 0:
          updater.install();
          break;
        case 1:
          mainWindow.webContents.send('save-file', 'update'); //send request to canvas.js
          break;
        case 2:
          break;
      }
    });
  }
  else{
    dialog.showMessageBox({ type: 'info', buttons: ['Riavvia', 'Non ora'], cancelId: 1, message: "E' stato scaricato un aggiornamento. Vuoi riavviare il programma per installarlo?"},
    function(response) {
      switch(response) {
        case 0:
          updater.install();
          break;
        case 1:
          break;
      }
    });
  }
});

ipcMain.on('update',function(){
  updater.install();
});

// Access electrons autoUpdater
updater.autoUpdater

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;
var transparentWindow = null;
var toolbarWindow = null;
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
  var electronScreen = electron.screen;
  var size = electronScreen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 1100/*size.width*/,
    height: 600/*size.height*/,
    transparent:false,
    fullscreen:false,
    frame: false,
    minWidth: 1100,
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
  if(mainWindow != null && mainWindow.webContents.getURL().indexOf('paper.html')>-1){
    dialog.showMessageBox({ type: 'info', buttons: ['Esci','Salva ed esci', 'Annulla'], cancelId: 2, message: "Sei sicuro di voler uscire?"},
    function(response) {
      switch(response) {
        case 0:
          app.quit();
          break;
        case 1:
          mainWindow.webContents.send('save-file', 'quit');
          break;
        case 2:
          break;
      }
    });
  }
  else app.quit();
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
ipcMain.on('new-default-window', function() {
  mainWindow.loadURL('file://' + __dirname + '/paper.html');
  mainWindow.maximize();
});
ipcMain.on('back-to-main', function() {
  if(transparentWindow!= null && toolbarWindow != null){  //If we were on transparent
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    toolbarWindow.close();
    transparentWindow.close();
    mainWindow.show();
    mainWindow.unmaximize();
  }
  else{                                                   //If we were on main
    if(mainWindow != null && mainWindow.webContents.getURL().indexOf('paper.html')>-1){
      dialog.showMessageBox({ type: 'info', buttons: ['Torna al menu','Salva e torna al menu', 'Annulla'], cancelId: 2, message: "Sei sicuro di voler tornare al menu?"},
      function(response) {
        switch(response) {
          case 0:
            mainWindow.loadURL('file://' + __dirname + '/index.html');
            mainWindow.show();
            mainWindow.unmaximize();
            break;
          case 1:
            mainWindow.webContents.send('save-file','back-to-main');
            break;
          case 2:
            break;
        }
      });
    }
    else app.quit();
  }
});
ipcMain.on('load-menu', function(){
  if(mainWindow!=null){
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.show();
    mainWindow.unmaximize();
  }
});
const toolbarWidth = 1000;
ipcMain.on('new-transparent-window', function() {
  mainWindow.hide();
  var electronScreen = electron.screen;
  var size = electronScreen.getPrimaryDisplay().workAreaSize;

  toolbarWindow = new BrowserWindow({
    width: toolbarWidth/*size.width*/,
    height: 80/*size.height*/,
    transparent:false,
    fullscreen:false,
    frame: false,
    resizable:false,
    skipTaskbar: true,
    minWidth: 990,
    minHeight: 80,
    maxHeight: 80,
    alwaysOnTop: true, // keep the toolbar ver the canvas
    x: size.width - toolbarWidth, // anchor the TB in bottomleft
    y: size.height - 80
  });
  toolbarWindow.loadURL('file://' + __dirname + '/transparent_toolbar.html');

  transparentWindow = new BrowserWindow({
    acceptFirstMouse:true,
    width: size.width,
    height: size.height,
    transparent:true,
    movable:false,
    resizable:false,
    fullscreen:true,
    frame: false,
    skipTaskbar: true,
    minWidth: 800,
    minHeight: 600
  });
  transparentWindow.loadURL('file://' + __dirname + '/transparent.html');

  transparentWindow.on('closed', function() {
    transparentWindow = null;
  });
  toolbarWindow.on('closed', function() {
    toolbarWindow = null;
  });

  transparentWindow.on('blur', function() {
    setImmediate(function() {
      if(toolbarWindow==null || toolbarWindow.isFocused()) return;
      toolbarWindow.setBounds({
        x: size.width - 100,
        y: size.height - 80,
        width: 100,
        height: 80
      });
      transparentWindow.hide();
      toolbarWindow.webContents.send('send-command', "hideLi");
    });
  });

  //toolbarWindow.blur();
  transparentWindow.focus();

});

ipcMain.on('send-command', function(e, target, command, parameters) {
   switch (target) {
    case "canvas":
      transparentWindow.webContents.send('send-command', command, parameters);
      break;
    case "toolbar":
      toolbarWindow.webContents.send('send-command', command, parameters);
      break;
    default:
      console.log('No target in IPC SENDCOMMAND');
      break;
  }
});
ipcMain.on('toggle-navbar', function(e, isOpen) {
  var electronScreen = electron.screen;
  var size = electronScreen.getPrimaryDisplay().workAreaSize;
    if (isOpen) {
      //toolbarWindow.setSize(80, 80);
      toolbarWindow.setBounds({
        x: size.width - 100,
        y: size.height - 80,
        width: 100,
        height: 80
      });
      transparentWindow.hide()
    } else {
      //toolbarWindow.setSize(850, 80);
      toolbarWindow.setBounds({
        x: size.width - toolbarWidth,
        y: size.height - 80,
        width: toolbarWidth,
        height: 80
      });
      transparentWindow.show()
    }
});
