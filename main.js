const { app, BrowserWindow, Menu, shell } = require('electron');
const fs = require('fs');
const windowStateKeeper = require('electron-window-state');

// The main window
let win = null;

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('ready', () => {
  // Load the previous state with fallback to defaults
  let mainWindowState = windowStateKeeper({
    defaultWidth: 1024,
    defaultHeight: 768
  });

  win = new BrowserWindow({
    'x': mainWindowState.x,
    'y': mainWindowState.y,
    'width': mainWindowState.width,
    'height': mainWindowState.height,
    titleBarStyle: 'hidden-inset'
  });

  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(win);
  
  const wc = win.webContents;

  function sendEscape(keyCode) {
    return () => {
      wc.sendInputEvent({ type: 'char', keyCode: 'Esc' });
      wc.sendInputEvent({ type: 'char', keyCode });
    };
  }

  function click(selector) {
    return () => {
      wc.executeJavaScript(`document.querySelector('${selector}').click()`);
    };
  }

  var template = [
    {
      label: 'Google Calendar',
      submenu: [
        { label: 'Settings', accelerator: 'Command+,', click: sendEscape('s') },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        },
        {
          label: 'Developer Tools',
          accelerator: 'Command+Alt+J',
          click: () => {
            win.openDevTools();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'New Event',
          accelerator: 'Command+N',
          click: sendEscape('c')
        },
        { label: 'Find', accelerator: 'Command+F', click: sendEscape('/') },
        {
          label: 'Goto to Today',
          accelerator: 'Command+T',
          click: sendEscape('t')
        },
        { type: 'separator' },
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Day View', accelerator: 'Command+1', click: sendEscape('1') },
        {
          label: 'Week View',
          accelerator: 'Command+2',
          click: sendEscape('2')
        },
        {
          label: 'Month View',
          accelerator: 'Command+3',
          click: sendEscape('3')
        },
        {
          label: 'Custom View',
          accelerator: 'Command+4',
          click: sendEscape('4')
        },
        {
          label: 'Schedule View',
          accelerator: 'Command+5',
          click: sendEscape('5')
        },
        {
          label: 'Year View',
          accelerator: 'Command+6',
          click: sendEscape('6')
        },
        { type: 'separator' },
        {
          label: 'Toggle Sidebar',
          accelerator: 'Command+.',
          click: click('.gb_ec')
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  wc.on('new-window', (ev, url, name) => {
    ev.preventDefault();
    if (url == 'about:blank') {
      // Create a hidden window (for Hangouts)
      ev.newGuest = new BrowserWindow({ show: false });
    } else {
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
