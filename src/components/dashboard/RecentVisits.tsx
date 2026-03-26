import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Visit } from '@/lib/types'
import useAppStore from '@/stores/useAppStore'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'

export function RecentVisits({ visits }: { visits: Visit[] }) {
  const { clients } = useAppStore()
  const { getVisitTotal } = useDashboardMetrics()

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.name || 'Desconhecido'

  return (
    <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Últimas Visitas</CardTitle>
        <CardDescription>Suas interações mais recentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visits.map((visit) => {
            const totalValue = getVisitTotal(visit)
            const hasSale = visit.items.some((i) => i.result === 'Venda')
            const allNoSale = visit.items.every((i) => i.result === 'Sem Venda')

            const status = hasSale ? 'Venda' : allNoSale ? 'Sem Venda' : 'Agendamento'

            return (
              <div
                key={visit.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-sm">{getClientName(visit.clientId)}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(visit.date), 'dd/MM/yyyy')} • {visit.items.length} interaç
                    {visit.items.length === 1 ? 'ão' : 'ões'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {totalValue > 0 && (
                    <span className="text-sm font-bold text-foreground">
                      R$ {totalValue.toLocaleString('pt-BR')}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      status === 'Venda'
                        ? 'border-success text-success bg-success/10'
                        : status === 'Sem Venda'
                          ? 'border-destructive text-destructive bg-destructive/10'
                          : 'border-warning text-warning bg-warning/10'
                    }
                  >
                    {status}
                  </Badge>
                </div>
              </div>
            )
          })}
          {visits.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma visita registrada.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
