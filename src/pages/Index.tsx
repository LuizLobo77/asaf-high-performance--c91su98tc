import { useState } from 'react'
import useAppStore from '@/stores/useAppStore'
import { ManagerDashboard } from '@/components/dashboard/ManagerDashboard'
import { SellerDashboard } from '@/components/dashboard/SellerDashboard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Index() {
  const { currentUser } = useAppStore()
  const [period, setPeriod] = useState('mes')

  if (!currentUser) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta, {currentUser.name}. Aqui está o resumo da sua performance.
          </p>
        </div>
        <div className="w-[180px]">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mês Atual</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {currentUser.role === 'gestor' ? (
        <ManagerDashboard period={period} />
      ) : (
        <SellerDashboard period={period} />
      )}
    </div>
  )
}
