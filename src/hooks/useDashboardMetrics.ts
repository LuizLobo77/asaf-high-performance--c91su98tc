import { useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import { format, parseISO, subDays, isAfter } from 'date-fns'
import type { Visit } from '@/lib/types'

export function useDashboardMetrics(userId?: string) {
  const { visits, users, industries, clients } = useAppStore()

  return useMemo(() => {
    const relevantVisits = userId ? visits.filter((v) => v.sellerId === userId) : visits

    const getVisitTotal = (v: Visit) =>
      v.items.reduce((acc, item) => acc + (item.result === 'Venda' ? item.value || 0 : 0), 0)

    const getVisitCommission = (v: Visit) =>
      v.items.reduce((acc, item) => {
        if (item.result === 'Venda' && item.value) {
          const ind = industries.find((i) => i.id === item.industryId)
          return acc + item.value * (ind?.commissionPercent || 0)
        }
        return acc
      }, 0)

    const salesVisits = relevantVisits.filter((v) => v.items.some((i) => i.result === 'Venda'))
    const totalSalesValue = relevantVisits.reduce((acc, v) => acc + getVisitTotal(v), 0)
    const totalCommission = relevantVisits.reduce((acc, v) => acc + getVisitCommission(v), 0)

    const totalVisitsCount = relevantVisits.length
    const conversionRate = totalVisitsCount ? (salesVisits.length / totalVisitsCount) * 100 : 0
    const averageTicket = salesVisits.length ? totalSalesValue / salesVisits.length : 0

    // Charts data
    const thirtyDaysAgo = subDays(new Date(), 30)
    const recentVisits = relevantVisits.filter((v) => isAfter(parseISO(v.date), thirtyDaysAgo))

    const sellerPerformance = users
      .filter((u) => u.role === 'vendedor')
      .map((seller) => {
        const sVisits = visits.filter((v) => v.sellerId === seller.id)
        const sSalesVisits = sVisits.filter((v) => v.items.some((i) => i.result === 'Venda'))
        const sTotalSales = sVisits.reduce((acc, v) => acc + getVisitTotal(v), 0)
        const sConv = sVisits.length ? (sSalesVisits.length / sVisits.length) * 100 : 0
        const sTicket = sSalesVisits.length ? sTotalSales / sSalesVisits.length : 0

        return {
          id: seller.id,
          name: seller.name,
          target: seller.target,
          actual: sTotalSales,
          visits: sVisits.length,
          salesCount: sSalesVisits.length,
          conversion: sConv,
          averageTicket: sTicket,
        }
      })
      .sort((a, b) => b.actual - a.actual)

    const industryData = industries
      .map((ind) => {
        const val = relevantVisits.reduce((acc, v) => {
          const itemSum = v.items
            .filter((i) => i.industryId === ind.id && i.result === 'Venda')
            .reduce((sum, i) => sum + (i.value || 0), 0)
          return acc + itemSum
        }, 0)
        return { name: ind.name, value: val }
      })
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value)

    const trendData = Array.from({ length: 30 }).map((_, i) => {
      const date = subDays(new Date(), 29 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const daySales = recentVisits
        .filter((v) => v.date.startsWith(dateStr))
        .reduce((acc, v) => acc + getVisitTotal(v), 0)
      return { date: format(date, 'dd/MM'), sales: daySales }
    })

    const clientsLastPurchase = clients
      .map((client) => {
        const clientVisits = relevantVisits.filter(
          (v) => v.clientId === client.id && v.items.some((i) => i.result === 'Venda'),
        )
        const sortedVisits = clientVisits.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        const lastVisit = sortedVisits[0]
        const lastPurchaseDate = lastVisit ? parseISO(lastVisit.date) : null
        const daysSince = lastPurchaseDate
          ? Math.floor((new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 3600 * 24))
          : Infinity

        return {
          id: client.id,
          name: client.name,
          lastPurchaseDate: lastPurchaseDate
            ? format(lastPurchaseDate, 'dd/MM/yyyy')
            : 'Sem compras',
          daysSince,
          needsAttention: daysSince > 30,
        }
      })
      .sort((a, b) => {
        if (a.daysSince === Infinity) return 1
        if (b.daysSince === Infinity) return -1
        return b.daysSince - a.daysSince
      })

    return {
      totalSalesValue,
      totalCommission,
      totalVisitsCount,
      conversionRate,
      averageTicket,
      sellerPerformance,
      industryData,
      trendData,
      clientsLastPurchase,
      recentVisitsList: relevantVisits.slice(0, 5),
      getVisitTotal,
    }
  }, [visits, userId, users, industries, clients])
}
