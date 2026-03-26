import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ClientPurchaseAnalysis({ data }: { data: any[] }) {
  return (
    <Card className="col-span-1 border-border/50 bg-card/80 backdrop-blur-sm flex flex-col h-full">
      <CardHeader>
        <CardTitle>Clientes por Data da Última Compra</CardTitle>
        <CardDescription>Acompanhe o ciclo de compras (alerta para &gt; 30 dias)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[300px]">
        <ScrollArea className="h-[300px] px-6 pb-6">
          <div className="space-y-4">
            {data.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-[#1E40AF]">{client.name}</span>
                  <span className="text-xs text-[#6B7280]">
                    Última compra: {client.lastPurchaseDate}
                  </span>
                </div>
                <div>
                  {client.needsAttention ? (
                    <Badge variant="destructive" className="font-normal text-xs">
                      {client.daysSince === Infinity ? 'Sem compras' : `+${client.daysSince} dias`}
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="font-normal text-xs bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Ativo ({client.daysSince} dias)
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {data.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Nenhum cliente encontrado.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
