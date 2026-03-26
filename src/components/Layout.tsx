import { Outlet, Navigate } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Header } from '@/components/layout/Header'
import useAppStore from '@/stores/useAppStore'

export default function Layout() {
  const { currentUser } = useAppStore()

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 p-4 md:p-6 max-w-[1440px] mx-auto w-full animate-fade-in overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
