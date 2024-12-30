// frontend/electron.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

console.log('Electron main process started');

function createWindow () {
  console.log('Creating Electron window...');
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  win.loadURL(process.env.NODE_ENV === 'development' 
    ? 'http://localhost:8080' 
    : `file://${path.join(__dirname, '../dist/index.html')}`
  );
  win.on('closed', () => {
    console.log('Electron window closed');
  });
}

app.whenReady().then(() => {
  console.log('App is ready');
  createWindow();

  app.on('activate', function () {
    console.log('App activated');
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  console.log('All windows closed');
  if (process.platform !== 'darwin') app.quit();
});
