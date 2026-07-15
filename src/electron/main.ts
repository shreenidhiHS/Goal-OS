import { app, BrowserWindow } from 'electron';
import { initDatabase, closeDatabase } from '../database/client';
import { registerAllHandlers } from './ipc/registerHandlers';
import { createWindow, getMainWindow } from './window/createWindow';
import { activityTracker } from './services/activity-tracker';
import { idleMonitor } from './services/idle-monitor';
import { focusEngine } from './services/focus-engine';
import { trayService } from './services/tray-service';

let mainWindow: BrowserWindow | null = null;

async function bootstrap() {
  initDatabase(app.getPath('userData'));
  registerAllHandlers();

  mainWindow = await createWindow();

  activityTracker.setMainWindow(mainWindow);
  idleMonitor.setMainWindow(mainWindow);
  focusEngine.setMainWindow(mainWindow);

  mainWindow.webContents.on('did-finish-load', () => {
    activityTracker.start();
    idleMonitor.start();
  });

  trayService.init(getMainWindow);
}

app.whenReady().then(bootstrap);

app.on('activate', async () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = await createWindow();
    activityTracker.setMainWindow(mainWindow);
    idleMonitor.setMainWindow(mainWindow);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  activityTracker.stop();
  idleMonitor.stop();
  trayService.destroy();
  closeDatabase();
});
