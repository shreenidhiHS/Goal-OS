import path from 'path';
import { app, BrowserWindow } from 'electron';

export async function createWindow(): Promise<BrowserWindow> {
  const isDev = process.env.ELECTRON_DEV === '1';

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    title: 'GoalOS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  if (isDev) {
    await win.loadURL('http://localhost:3000');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    await win.loadFile(path.join(app.getAppPath(), 'dist/renderer/index.html'));
  }

  return win;
}

export function getMainWindow(): BrowserWindow | null {
  const windows = BrowserWindow.getAllWindows();
  return windows[0] ?? null;
}
