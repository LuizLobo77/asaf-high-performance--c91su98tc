import { useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import { format, parseISO, subDays, isAfter } from 'date-fns'
import type { Visit } from '@/lib/types'

export function useDashboardMetrics(userId?: string) {
  const { visits, users, industries, clients } = useAppStore()

  return useMemo(() => {
    const today = new Date()
    const thirtyDaysAgo = subDays(today, 30)
    const sixtyDaysAgo = subDays(today, 60)

    const relevantVisits = userId ? visits.filter((v) => v.sellerId === userId) : visits

    const currentVisits = relevantVisits.filter((v) => isAfter(parseISO(v.date), thirtyDaysAgo))
    const previousVisits = relevantVisits.filter(
      (v) => isAfter(parseISO(v.date), sixtyDaysAgo) && !isAfter(parseISO(v.date), thirtyDaysAgo),
    )

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

    const calcMetrics = (visitList: Visit[]) => {
      const sales = visitList.filter((v) => v.items.some((i) => i.result === 'Venda'))
      const totalVal = visitList.reduce((acc, v) => acc + getVisitTotal(v), 0)
      const totalComm = visitList.reduce((acc, v) => acc + getVisitCommission(v), 0)
      const totalCount = visitList.length
      const convRate = totalCount ? (sales.length / totalCount) * 100 : 0
      const avgTick = sales.length ? totalVal / sales.length : 0

      return { totalVal, totalComm, totalCount, convRate, avgTick, sales }
    }

    const currentMetrics = calcMetrics(currentVisits)
    const previousMetrics = calcMetrics(previousVisits)

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0 && curr === 0) return { value: 0, status: 'stable' as const }
      if (prev === 0) return { value: 100, status: 'up' as const }
      const diff = ((curr - prev) / prev) * 100
      let status: 'up' | 'down' | 'stable' = 'stable'
      if (diff > 0) status = 'up'
      if (diff < 0) status = 'down'
      return { value: Math.abs(diff), status }
    }

    const trends = {
      sales: calcTrend(currentMetrics.totalVal, previousMetrics.totalVal),
      commission: calcTrend(currentMetrics.totalComm, previousMetrics.totalComm),
      visits: calcTrend(currentMetrics.totalCount, previousMetrics.totalCount),
      conversion: calcTrend(currentMetrics.convRate, previousMetrics.convRate),
      ticket: calcTrend(currentMetrics.avgTick, previousMetrics.avgTick),
    }

    const sellerPerformance = users
      .filter((u) => u.role === 'vendedor')
      .map((seller) => {
        const sVisits = currentVisits.filter((v) => v.sellerId === seller.id)
        const sMetrics = calcMetrics(sVisits)

        return {
          id: seller.id,
          name: seller.name,
          target: seller.target,
          actual: sMetrics.totalVal,
          visits: sMetrics.totalCount,
          salesCount: sMetrics.sales.length,
          conversion: sMetrics.convRate,
          averageTicket: sMetrics.avgTick,
        }
      })
      .sort((a, b) => b.actual - a.actual)

    const industryData = industries
      .map((ind) => {
        const val = currentVisits.reduce((acc, v) => {
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
      const date = subDays(today, 29 - i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const daySales = currentVisits
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
      totalSalesValue: currentMetrics.totalVal,
      totalCommission: currentMetrics.totalComm,
      totalVisitsCount: currentMetrics.totalCount,
      conversionRate: currentMetrics.convRate,
      averageTicket: currentMetrics.avgTick,
      trends,
      sellerPerformance,
      industryData,
      trendData,
      clientsLastPurchase,
      recentVisitsList: currentVisits.slice(0, 5),
      getVisitTotal,
    }
  }, [visits, userId, users, industries, clients])
}
