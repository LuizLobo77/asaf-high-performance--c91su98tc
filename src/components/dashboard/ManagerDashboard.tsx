import { DollarSign, Percent, Briefcase, Target, HandCoins } from 'lucide-react'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { StatCard } from './StatCard'
import { ManagerTargetChart } from '@/components/charts/ManagerTargetChart'
import { ManagerIndustryChart } from '@/components/charts/ManagerIndustryChart'
import { TrendChart } from '@/components/charts/TrendChart'

export function ManagerDashboard() {
  const metrics = useDashboardMetrics()

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Vendas Totais"
          value={`R$ ${metrics.totalSalesValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
        />
        <StatCard
          title="Comissões Estimadas"
          value={`R$ ${metrics.totalCommission.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          icon={HandCoins}
        />
        <StatCard
          title="Conversão (Visitas)"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={Percent}
        />
        <StatCard
          title="Ticket Médio"
          value={`R$ ${metrics.averageTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          icon={Briefcase}
        />
        <StatCard title="Total de Visitas" value={metrics.totalVisitsCount} icon={Target} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ManagerTargetChart data={metrics.sellerPerformance} />
        <ManagerIndustryChart data={metrics.industryData} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TrendChart
          data={metrics.trendData}
          title="Tendência de Vendas"
          description="Evolução diária das vendas nos últimos 30 dias"
        />
      </div>
    </div>
  )
}
