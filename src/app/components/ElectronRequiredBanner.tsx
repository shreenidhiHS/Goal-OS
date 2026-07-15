import { isElectronAvailable } from '@app/lib/ipc';

export function ElectronRequiredBanner() {
  if (isElectronAvailable()) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
      Running in the browser — use the GoalOS Electron window for database and tracking.
    </div>
  );
}
