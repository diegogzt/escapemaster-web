import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { MobileNav } from "@/components/layout/header/mobile-nav";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileDrawer } from "@/components/layout/mobile-drawer";
import { ViewRenderer } from "@/components/layout/ViewRenderer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <AppSidebar />
      <div className="flex-1 flex flex-col pb-16 md:pb-0">
        <MobileNav />
        <main className="flex-1 p-4 md:p-6 min-w-0 overflow-x-hidden" data-testid="main-content">
          <ViewRenderer>{children}</ViewRenderer>
        </main>
        <BottomNav />
      </div>
      <MobileDrawer />
    </div>
  );
}
