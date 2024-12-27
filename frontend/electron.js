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
      // preload: path.join(__dirname, 'preload.js') // Удалите, если не используете
    }
  });

  win.loadURL('https://example.com'); // Для теста используйте внешний URL
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
