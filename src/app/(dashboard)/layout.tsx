import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { MobileNav } from "@/components/layout/header/mobile-nav";
import { BottomNav } from "@/components/layout/bottom-nav";

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
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
