import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import PlayerOverlay from "./PlayerOverlay";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Header />
        <main className="flex-1 overflow-y-auto pb-28 px-4 sm:px-8 py-6 custom-scrollbar">
          {children}
        </main>
      </div>
      <PlayerOverlay />
    </div>
  );
}
