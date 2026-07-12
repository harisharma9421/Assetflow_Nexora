/**
 * Dashboard route group layout
 * Wraps all authenticated app routes with the sidebar + topbar shell
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--color-background))]">
      {/* Sidebar will be built in layout component phase */}
      <aside className="hidden w-64 flex-shrink-0 bg-[hsl(var(--color-sidebar))] lg:block">
        {/* AppSidebar component goes here */}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar will be built in layout component phase */}
        <header className="flex h-14 items-center border-b border-[hsl(var(--color-border))] bg-white px-6">
          {/* AppTopbar component goes here */}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
