import { useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import { format, parseISO, startOfWeek, subDays, isAfter } from 'date-fns'

export function useDashboardMetrics(userId?: string) {
  const { visits, users, industries } = useAppStore()

  return useMemo(() => {
    const relevantVisits = userId ? visits.filter((v) => v.sellerId === userId) : visits

    const salesVisits = relevantVisits.filter((v) => v.result === 'Venda')
    const totalSalesValue = salesVisits.reduce((acc, v) => acc + (v.value || 0), 0)
    const totalVisitsCount = relevantVisits.length
    const conversionRate = totalVisitsCount ? (salesVisits.length / totalVisitsCount) * 100 : 0
    const averageTicket = salesVisits.length ? totalSalesValue / salesVisits.length : 0

    // For charts
    const thirtyDaysAgo = subDays(new Date(), 30)
    const recentVisits = relevantVisits.filter((v) => isAfter(parseISO(v.date), thirtyDaysAgo))

    // Manager: Performance per seller
    const sellerPerformance = users
      .filter((u) => u.role === 'vendedor')
      .map((seller) => {
        const sVisits = visits.filter((v) => v.sellerId === seller.id)
        const sSales = sVisits.filter((v) => v.result === 'Venda')
        const sTotalSales = sSales.reduce((acc, v) => acc + (v.value || 0), 0)
        const sConv = sVisits.length ? (sSales.length / sVisits.length) * 100 : 0
        const sTicket = sSales.length ? sTotalSales / sSales.length : 0
        return {
          id: seller.id,
          name: seller.name,
          target: seller.target,
          actual: sTotalSales,
          visits: sVisits.length,
          salesCount: sSales.length,
          conversion: sConv,
          averageTicket: sTicket,
        }
      })
      .sort((a, b) => b.actual - a.actual)

    // Manager: Industry distribution
    const industryData = industries
      .map((ind) => {
        const val = salesVisits
          .filter((v) => v.industryId === ind.id)
          .reduce((acc, v) => acc + (v.value || 0), 0)
        return { name: ind.name, value: val }
      })
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value)

    // Trend over time (grouped by day for the last 30 days)
    const trendData = Array.from({ length: 30 }).map((_, i) => {
      const date = subDays(new Date(), 29 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const daySales = recentVisits
        .filter((v) => v.date.startsWith(dateStr) && v.result === 'Venda')
        .reduce((acc, v) => acc + (v.value || 0), 0)
      return { date: format(date, 'dd/MM'), sales: daySales }
    })

    return {
      totalSalesValue,
      totalVisitsCount,
      conversionRate,
      averageTicket,
      sellerPerformance,
      industryData,
      trendData,
      recentVisitsList: relevantVisits.slice(0, 5),
    }
  }, [visits, userId, users, industries])
}
