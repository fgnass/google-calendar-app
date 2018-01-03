const { app, BrowserWindow, Menu, shell } = require('electron');
const fs = require('fs');

// The main window
let win = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});

app.on('ready', () => {
  win = new BrowserWindow({
    width: 1024,
    height: 768
  });

  var template = [{
    label: 'Gmail',
    submenu: [
      { label: 'Quit', accelerator: 'Command+Q', click: () => { app.quit(); }},
      { label: 'Developer Tools', accelerator: 'Command+Alt+J', click: () => { win.openDevTools(); }}
    ]}, {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'Command+A', selector: 'selectAll:' }
    ]}
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  const wc = win.webContents;

  wc.on('new-window', (ev, url, name) => {
    ev.preventDefault();
    if (url == 'about:blank') {
      // Create a hidden window (for Hangouts)
      ev.newGuest = new BrowserWindow({ show: false });
    }
    else {
      // Open URLs in the default browser
      shell.openExternal(url);
    }
  });

  win.loadURL('https://www.google.com/calendar');

  // Inject custom CSS and JavaScript code on dom-ready
  wc.on('dom-ready', () => {
    wc.insertCSS(fs.readFileSync(__dirname + '/inject.css', 'utf8'));
    wc.executeJavaScript(fs.readFileSync(__dirname + '/inject.js', 'utf8'));
  });

  win.on('closed', () => {
    win = null;
  });
});
