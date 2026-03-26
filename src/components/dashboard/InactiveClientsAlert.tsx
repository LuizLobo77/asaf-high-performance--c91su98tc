import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export function InactiveClientsAlert({ data }: { data: any[] }) {
  return (
    <Card className="col-span-1 border-border/50 bg-card/80 backdrop-blur-sm flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-destructive">Atenção: Clientes Inativos</CardTitle>
        <CardDescription>Monitoramento de ausência de compras (&gt; 30 dias)</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[250px]">
        <ScrollArea className="h-[250px] px-6 pb-6">
          <div className="space-y-4 mt-1">
            {data.map((client) => (
              <div
                key={client.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50 gap-2"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-foreground">{client.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Vendedor: {client.sellerName}
                  </span>
                </div>
                <div className="self-start sm:self-auto">
                  <Badge
                    variant={client.status === 'red' ? 'destructive' : 'outline'}
                    className={
                      client.status === 'orange'
                        ? 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950 dark:text-orange-400 font-normal text-xs'
                        : 'font-normal text-xs'
                    }
                  >
                    {client.status === 'red' ? '🔴' : '🟠'}{' '}
                    {client.daysSince === Infinity ? '+90' : client.daysSince} dias
                  </Badge>
                </div>
              </div>
            ))}
            {data.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Nenhum cliente inativo encontrado.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
