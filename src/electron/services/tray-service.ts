import { Tray, Menu, app, BrowserWindow, nativeImage } from 'electron';
import path from 'path';
import { activityTracker } from './activity-tracker';
import { settingsRepository } from '../../database/repositories/settings.repository';
import { getAppIcon } from '../lib/app-icon';

function createTrayImage() {
  const icon = getAppIcon();
  if (!icon.isEmpty()) {
    // Tray prefers a smaller template on macOS; resize the app icon
    const size = process.platform === 'darwin' ? 22 : 32;
    return icon.resize({ width: size, height: size });
  }

  const trayPng = path.join(
    app.isPackaged ? process.resourcesPath : path.join(app.getAppPath(), 'resources', 'icons'),
    app.isPackaged ? 'icon.png' : 'icon-32.png',
  );
  const fromFile = nativeImage.createFromPath(trayPng);
  return fromFile.isEmpty() ? nativeImage.createEmpty() : fromFile;
}

export class TrayService {
  private tray: Tray | null = null;

  init(getMainWindow: () => BrowserWindow | null): void {
    const icon = createTrayImage();
    this.tray = new Tray(icon);
    this.tray.setToolTip('GoalOS');

    this.updateMenu(getMainWindow);
    this.tray.on('double-click', () => {
      const win = getMainWindow();
      if (win) {
        win.show();
        win.focus();
      }
    });
  }

  updateMenu(getMainWindow: () => BrowserWindow | null): void {
    if (!this.tray) return;

    const settings = settingsRepository.get();
    const trackingEnabled = settings.trackingEnabled;

    const menu = Menu.buildFromTemplate([
      {
        label: 'Open Dashboard',
        click: () => {
          const win = getMainWindow();
          if (win) {
            win.show();
            win.focus();
          }
        },
      },
      {
        label: trackingEnabled ? 'Pause Tracking' : 'Start Tracking',
        click: () => {
          const newValue = !trackingEnabled;
          settingsRepository.set({ trackingEnabled: newValue });
          if (newValue) {
            activityTracker.start();
          } else {
            activityTracker.stop();
          }
          this.updateMenu(getMainWindow);
        },
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => app.quit(),
      },
    ]);

    this.tray.setContextMenu(menu);
  }

  destroy(): void {
    this.tray?.destroy();
    this.tray = null;
  }
}

export const trayService = new TrayService();
