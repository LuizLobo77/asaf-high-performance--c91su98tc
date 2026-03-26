import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  Plus,
  Trophy,
  Users,
  Contact,
  Upload,
  Settings,
  BarChart2,
  Building2,
  Shield,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import useAppStore from '@/stores/useAppStore'

export function AppSidebar() {
  const location = useLocation()
  const { currentUser, logoUrl } = useAppStore()
  const { setOpenMobile, isMobile } = useSidebar()

  if (!currentUser) return null

  const isManager = currentUser.role === 'gestor'

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-6">
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="ASAF"
              className="w-10 h-10 object-contain rounded-lg shadow-sm bg-white p-1"
            />
          ) : (
            <div className="w-10 h-10 bg-[#1E40AF] rounded-lg flex items-center justify-center text-primary-foreground shadow-md">
              <BarChart2 className="w-6 h-6" />
            </div>
          )}
          <span className="font-bold text-xl tracking-tight text-foreground">ASAF</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-4 py-2">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/'}>
              <Link to="/" onClick={handleNavClick}>
                <Home className="w-5 h-5" /> <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/registrar'}>
              <Link to="/registrar" onClick={handleNavClick}>
                <Plus className="w-5 h-5" /> <span>Registrar Visita</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {isManager && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/ranking'}>
                <Link to="/ranking" onClick={handleNavClick}>
                  <Trophy className="w-5 h-5" /> <span>Ranking</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/clientes'}>
              <Link to="/clientes" onClick={handleNavClick}>
                <Contact className="w-5 h-5" /> <span>Clientes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {isManager && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/vendedores'}>
                <Link to="/vendedores" onClick={handleNavClick}>
                  <Users className="w-5 h-5" /> <span>Equipe de Vendas</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {isManager && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/industrias'}>
                <Link to="/industrias" onClick={handleNavClick}>
                  <Building2 className="w-5 h-5" /> <span>Indústrias</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {isManager && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/acessos'}>
                <Link to="/acessos" onClick={handleNavClick}>
                  <Shield className="w-5 h-5" /> <span>Gestão de Acessos</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {isManager && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === '/importar-dados'}>
                <Link to="/importar-dados" onClick={handleNavClick}>
                  <Upload className="w-5 h-5" /> <span>Importar Dados</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/configuracoes'}>
              <Link to="/configuracoes" onClick={handleNavClick}>
                <Settings className="w-5 h-5" /> <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border mt-auto">
        <div className="flex flex-col">
          <span className="text-sm font-semibold truncate text-[#1E40AF]">{currentUser.name}</span>
          <span className="text-xs text-[#6B7280] capitalize">{currentUser.role}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
