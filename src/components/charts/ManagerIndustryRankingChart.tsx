import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

export function ManagerIndustryRankingChart({ data }: { data: any[] }) {
  const chartConfig = {
    value: { label: 'Vendas (R$)', color: 'hsl(var(--primary))' },
  }

  return (
    <Card className="col-span-1 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Ranking de Indústrias</CardTitle>
        <CardDescription>Indústrias com melhor performance de vendas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => `R$${val / 1000}k`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  width={140}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      valueFormatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`}
                    />
                  }
                  cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                />
                <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={24}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
