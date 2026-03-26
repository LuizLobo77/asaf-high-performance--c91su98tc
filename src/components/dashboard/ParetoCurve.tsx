import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ParetoCurve({ data }: { data: any[] }) {
  return (
    <Card className="col-span-1 border-border/50 bg-card/80 backdrop-blur-sm flex flex-col h-full">
      <CardHeader>
        <CardTitle>Top Clientes (Pareto 80/20)</CardTitle>
        <CardDescription>Clientes que representam ~80% do faturamento</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative min-h-[250px]">
        <ScrollArea className="h-[250px] px-6 pb-6">
          <div className="space-y-5 mt-1">
            {data.map((c, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium truncate pr-2" title={c.client}>
                    {c.client}
                  </span>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-bold text-foreground">
                      R$ {c.value.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {c.percentage.toFixed(1)}% do total
                    </span>
                  </div>
                </div>
                <Progress value={c.percentage} className="h-1.5" />
              </div>
            ))}
            {data.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                Nenhum dado de vendas no período.
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
