import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ElectronRequiredBanner } from '../ElectronRequiredBanner';
import { AiAgentFab } from '../ai/AiAgentFab';
import { AiAgentPanel } from '../ai/AiAgentPanel';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ElectronRequiredBanner />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar />
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
          <AiAgentPanel />
          <AiAgentFab />
        </div>
      </div>
    </div>
  );
}
