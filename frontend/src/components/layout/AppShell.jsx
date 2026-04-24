import { Outlet } from 'react-router-dom';
import { NavTree } from './NavTree';
import { TopBar } from './TopBar';
import { CommandPalette } from './CommandPalette';

export function AppShell() {
  return (
    <div className="h-full flex bg-surface-950">
      <NavTree />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto px-5 py-4">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
