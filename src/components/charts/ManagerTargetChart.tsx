import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'

const chartConfig = {
  actual: { label: 'Realizado (R$)', color: 'hsl(var(--primary))' },
  target: { label: 'Meta (R$)', color: 'hsl(var(--muted))' },
}

export function ManagerTargetChart({ data }: { data: any[] }) {
  return (
    <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Meta vs. Realizado</CardTitle>
        <CardDescription>Acompanhamento mensal por vendedor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(val) => `R$${val / 1000}k`}
                />
                <Tooltip
                  content={<ChartTooltipContent />}
                  cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  dataKey="target"
                  name="Meta"
                  fill="var(--color-target)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="actual"
                  name="Realizado"
                  fill="var(--color-actual)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
