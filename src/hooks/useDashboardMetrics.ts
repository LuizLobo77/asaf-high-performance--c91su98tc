import { useMemo } from 'react'
import useAppStore from '@/stores/useAppStore'
import { format, parseISO, subDays, isAfter } from 'date-fns'
import type { Visit } from '@/lib/types'

export function useDashboardMetrics(userId?: string, period: string = 'mes') {
  const { visits, users, industries, clients } = useAppStore()

  return useMemo(() => {
    const today = new Date()

    let days = 30
    if (period === 'trimestre') days = 90
    if (period === 'ano') days = 365

    const startDate = subDays(today, days)
    const prevStartDate = subDays(today, days * 2)

    const relevantVisits = userId ? visits.filter((v) => v.sellerId === userId) : visits

    const currentVisits = relevantVisits.filter((v) => isAfter(parseISO(v.date), startDate))
    const previousVisits = relevantVisits.filter(
      (v) => isAfter(parseISO(v.date), prevStartDate) && !isAfter(parseISO(v.date), startDate),
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

    const maxChartDays = Math.min(days, 30) // Limit chart points for readability
    const trendData = Array.from({ length: maxChartDays }).map((_, i) => {
      const step = days / maxChartDays
      const date = subDays(today, Math.floor((maxChartDays - 1 - i) * step))
      const dateStr = format(date, 'yyyy-MM-dd')
      const daySales = currentVisits
        .filter((v) => v.date.startsWith(dateStr))
        .reduce((acc, v) => acc + getVisitTotal(v), 0)
      return { date: format(date, 'dd/MM'), sales: daySales }
    })

    const inactiveClients = clients
      .filter((c) => !userId || c.sellerId === userId)
      .map((client) => {
        // Look at ALL relevant visits to determine true last purchase
        const clientVisits = relevantVisits.filter(
          (v) => v.clientId === client.id && v.items.some((i) => i.result === 'Venda'),
        )
        const sortedVisits = clientVisits.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        const lastVisit = sortedVisits[0]
        const lastPurchaseDate = lastVisit ? parseISO(lastVisit.date) : null
        const daysSince = lastPurchaseDate
          ? Math.floor((today.getTime() - lastPurchaseDate.getTime()) / (1000 * 3600 * 24))
          : Infinity

        const sellerName = users.find((u) => u.id === client.sellerId)?.name || 'Desconhecido'

        let status = 'green'
        if (daysSince > 90 || daysSince === Infinity) status = 'red'
        else if (daysSince > 30) status = 'orange'

        return {
          id: client.id,
          name: client.name,
          sellerName,
          daysSince,
          status,
        }
      })
      .filter((c) => c.status !== 'green')
      .sort((a, b) => b.daysSince - a.daysSince)

    const clientSales = new Map<string, number>()
    let totalPeriodSales = 0
    currentVisits.forEach((v) => {
      const saleValue = getVisitTotal(v)
      if (saleValue > 0) {
        clientSales.set(v.clientId, (clientSales.get(v.clientId) || 0) + saleValue)
        totalPeriodSales += saleValue
      }
    })

    const paretoClientsList = Array.from(clientSales.entries())
      .map(([clientId, value]) => ({
        id: clientId,
        client: clients.find((c) => c.id === clientId)?.name || 'Desconhecido',
        value,
        percentage: totalPeriodSales > 0 ? (value / totalPeriodSales) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value)

    let accumulatedPercent = 0
    const paretoClients = []
    for (const c of paretoClientsList) {
      if (accumulatedPercent < 80) {
        paretoClients.push(c)
        accumulatedPercent += c.percentage
      } else {
        break
      }
    }
    if (paretoClients.length === 0 && paretoClientsList.length > 0) {
      paretoClients.push(paretoClientsList[0])
    }

    const indSales = industries
      .map((ind) => {
        const val = currentVisits.reduce((acc, v) => {
          return (
            acc +
            v.items
              .filter((i) => i.industryId === ind.id && i.result === 'Venda')
              .reduce((sum, i) => sum + (i.value || 0), 0)
          )
        }, 0)
        return { id: ind.id, name: ind.name, value: val }
      })
      .sort((a, b) => a.value - b.value)

    const lowTractionIndustries = indSales.slice(0, 5)

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
      inactiveClients,
      paretoClients,
      lowTractionIndustries,
      recentVisitsList: currentVisits
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
      getVisitTotal,
    }
  }, [visits, userId, period, users, industries, clients])
}
