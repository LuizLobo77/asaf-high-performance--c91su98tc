import { DollarSign, Percent, Target, Activity } from 'lucide-react'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { StatCard } from './StatCard'
import { TrendChart } from '@/components/charts/TrendChart'
import { RecentVisits } from './RecentVisits'
import useAppStore from '@/stores/useAppStore'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function SellerDashboard() {
  const { currentUser } = useAppStore()
  const metrics = useDashboardMetrics(currentUser.id)

  const targetProgress =
    currentUser.target > 0 ? Math.min((metrics.totalSalesValue / currentUser.target) * 100, 100) : 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Minhas Vendas"
          value={`R$ ${metrics.totalSalesValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
        />
        <StatCard
          title="Minha Conversão"
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={Percent}
        />
        <StatCard
          title="Meu Ticket Médio"
          value={`R$ ${metrics.averageTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          icon={Activity}
        />
        <Card className="col-span-1 overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progresso da Meta
            </CardTitle>
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
              R$ {metrics.totalSalesValue.toLocaleString('pt-BR')} / R${' '}
              {currentUser.target.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <TrendChart
            data={metrics.trendData}
            title="Minha Performance"
            description="Vendas diárias nos últimos 30 dias"
          />
        </div>
        <div className="lg:col-span-2">
          <RecentVisits visits={metrics.recentVisitsList} />
        </div>
      </div>
    </div>
  )
}
