import path from 'path';
import { app, nativeImage } from 'electron';

/**
 * Resolve GoalOS app icon for window / tray.
 * Dev: repo `build/icon.png`
 * Packaged: resources next to asar / from electron-builder
 */
export function getAppIconPath(): string {
  if (app.isPackaged) {
    // electron-builder places converted icons in Resources; PNG may also be bundled
    return path.join(process.resourcesPath, 'icon.png');
  }
  return path.join(app.getAppPath(), 'build', 'icon.png');
}

export function getAppIcon() {
  const iconPath = getAppIconPath();
  const image = nativeImage.createFromPath(iconPath);
  if (image.isEmpty()) {
    // Fallback for unpacked dist runs (appPath = project root)
    const fallback = path.join(__dirname, '../../../build/icon.png');
    return nativeImage.createFromPath(fallback);
  }
  return image;
}
