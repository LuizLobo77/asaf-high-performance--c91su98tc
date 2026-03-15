import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; isUp: boolean }
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
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {(subtitle || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span className={cn('font-medium', trend.isUp ? 'text-success' : 'text-destructive')}>
                {trend.isUp ? '+' : '-'}
                {Math.abs(trend.value)}%
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
