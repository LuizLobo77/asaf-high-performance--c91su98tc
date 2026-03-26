import { DollarSign, Percent, Target, Activity, HandCoins } from 'lucide-react'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { StatCard } from './StatCard'
import { TrendChart } from '@/components/charts/TrendChart'
import { RecentVisits } from './RecentVisits'
import useAppStore from '@/stores/useAppStore'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InactiveClientsAlert } from '@/components/dashboard/InactiveClientsAlert'
import { ParetoCurve } from '@/components/dashboard/ParetoCurve'
import { LowTractionIndustries } from '@/components/dashboard/LowTractionIndustries'

export function SellerDashboard({ period = 'mes' }: { period?: string }) {
  const { currentUser } = useAppStore()

  const metrics = useDashboardMetrics(currentUser?.id, period)

  if (!currentUser) return null

  const targetProgress =
    currentUser.target > 0 ? Math.min((metrics.totalSalesValue / currentUser.target) * 100, 100) : 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Minhas Vendas"
          value={`R$ ${metrics.totalSalesValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          trend={metrics.trends.sales}
        />
        <StatCard
          title="Minhas Comissões"
          value={`R$ ${metrics.totalCommission.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          icon={HandCoins}
          trend={metrics.trends.commission}
        />
        <StatCard
          title="Conversão"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={Percent}
          trend={metrics.trends.conversion}
        />
        <StatCard
          title="Ticket Médio"
          value={`R$ ${metrics.averageTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          icon={Activity}
          trend={metrics.trends.ticket}
        />
        <Card className="col-span-1 overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Progresso</CardTitle>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight mb-2">
              {targetProgress.toFixed(1)}%
            </div>
            <Progress value={targetProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Meta: R$ {currentUser.target.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InactiveClientsAlert data={metrics.inactiveClients} />
        <ParetoCurve data={metrics.paretoClients} />
        <LowTractionIndustries data={metrics.lowTractionIndustries} period={period} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <TrendChart
            data={metrics.trendData}
            title="Minha Performance"
            description="Vendas diárias no período selecionado"
          />
        </div>
        <div className="lg:col-span-2">
          <RecentVisits visits={metrics.recentVisitsList} />
        </div>
      </div>
    </div>
  )
}
