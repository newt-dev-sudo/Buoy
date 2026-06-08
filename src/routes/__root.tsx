import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { Titlebar } from "../components/layout/Titlebar";
import { CloseDialog } from "../components/layout/CloseDialog";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="flex h-full flex-col bg-surface-base text-text-primary">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <CloseDialog />
    </div>
  );
}
