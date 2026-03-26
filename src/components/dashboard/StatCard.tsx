import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; status: 'up' | 'down' | 'stable' }
  className?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }: StatCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-md border-border/50 bg-card/80 backdrop-blur-sm',
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  'font-medium flex items-center',
                  trend.status === 'up' && 'text-green-500',
                  trend.status === 'down' && 'text-red-500',
                  trend.status === 'stable' && 'text-gray-400',
                )}
              >
                {trend.status === 'up' && <ArrowUp className="w-3 h-3 mr-1" />}
                {trend.status === 'down' && <ArrowDown className="w-3 h-3 mr-1" />}
                {trend.status === 'stable' && <Minus className="w-3 h-3 mr-1" />}
                {trend.value.toFixed(1)}%
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
