import useAppStore from '@/stores/useAppStore'
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard'
import { SellerDashboard } from '@/components/dashboard/SellerDashboard'

export default function Index() {
  const { currentUser } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bem-vindo de volta, {currentUser.name}. Aqui está o resumo da sua performance.
        </p>
      </div>

      {currentUser.role === 'gestor' ? <ManagerDashboard /> : <SellerDashboard />}
    </div>
  )
}
