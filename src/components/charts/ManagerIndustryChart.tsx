import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export function ManagerIndustryChart({ data }: { data: any[] }) {
  // Generate config based on available data
  const config = Object.fromEntries(
    data.map((item, index) => [
      item.name,
      { label: item.name, color: `hsl(var(--chart-${(index % 5) + 1}))` },
    ]),
  )

  return (
    <Card className="col-span-1 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Por Indústria</CardTitle>
        <CardDescription>Distribuição de vendas (R$)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`var(--color-${entry.name})`} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      valueFormatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`}
                    />
                  }
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
