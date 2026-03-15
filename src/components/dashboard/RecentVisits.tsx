import { format, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Visit } from '@/lib/types'
import useAppStore from '@/stores/useAppStore'

export function RecentVisits({ visits }: { visits: Visit[] }) {
  const { clients } = useAppStore()

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.name || 'Desconhecido'

  return (
    <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Últimas Visitas</CardTitle>
        <CardDescription>Suas atividades mais recentes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{getClientName(visit.clientId)}</span>
                <span className="text-xs text-muted-foreground">
                  {format(parseISO(visit.date), 'dd/MM/yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {visit.value && visit.result === 'Venda' && (
                  <span className="text-sm font-bold text-foreground">
                    R$ {visit.value.toLocaleString('pt-BR')}
                  </span>
                )}
                <Badge
                  variant="outline"
                  className={
                    visit.result === 'Venda'
                      ? 'border-success text-success bg-success/10'
                      : visit.result === 'Sem Venda'
                        ? 'border-destructive text-destructive bg-destructive/10'
                        : 'border-warning text-warning bg-warning/10'
                  }
                >
                  {visit.result}
                </Badge>
              </div>
            </div>
          ))}
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
