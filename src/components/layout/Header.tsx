import { Bell, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useAppStore from '@/stores/useAppStore'

export function Header() {
  const { currentUser, logout } = useAppStore()

  if (!currentUser) return null

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" aria-label="Abrir menu" />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>
        <div className="border-l border-border pl-4 flex items-center">
          <Button variant="ghost" size="icon" onClick={logout} title="Sair da Conta">
            <LogOut className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  )
}
