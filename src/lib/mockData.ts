import { subDays, formatISO } from 'date-fns'
import type { User, Client, Industry, Visit, VisitItem, VisitResult, CommissionRule } from './types'

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Carlos Gestor',
    email: 'carlos@asaf.com',
    role: 'gestor',
    target: 0,
    status: 'active',
    phone: '(11) 99999-0000',
  },
  {
    id: 'u2',
    name: 'Ana Vendedora',
    email: 'ana@asaf.com',
    role: 'vendedor',
    target: 150000,
    status: 'active',
    phone: '(11) 99999-1111',
  },
  {
    id: 'u3',
    name: 'João Silva',
    email: 'joao@asaf.com',
    role: 'vendedor',
    target: 120000,
    status: 'active',
    phone: '(11) 99999-2222',
  },
  {
    id: 'u4',
    name: 'Marcos Santos',
    email: 'marcos@asaf.com',
    role: 'vendedor',
    target: 100000,
    status: 'inactive',
    phone: '(11) 99999-3333',
  },
]

export const mockIndustries: Industry[] = [
  { id: 'i1', name: 'Ferragens Avançadas', commissionPercent: 0.05 },
  { id: 'i2', name: 'Tubos e Conexões S.A.', commissionPercent: 0.08 },
  { id: 'i3', name: 'Elétrica Brasil', commissionPercent: 0.06 },
  { id: 'i4', name: 'Ferramentas Pro', commissionPercent: 0.1 },
]

export const mockCommissionRules: CommissionRule[] = [
  { id: 'cr1', sellerId: 'u2', industryId: 'i1', splitPercent: 25 },
  { id: 'cr2', sellerId: 'u2', industryId: 'i2', splitPercent: 30 },
]

export const mockClients: Client[] = [
  { id: 'c1', name: 'Construtora Alfa', region: 'Sul', sellerId: 'u2' },
  { id: 'c2', name: 'Depósito Central', region: 'Norte', sellerId: 'u3' },
  { id: 'c3', name: 'Lojas Beta', region: 'Leste', sellerId: 'u2' },
  { id: 'c4', name: 'Material de Construção X', region: 'Oeste', sellerId: 'u4' },
  { id: 'c5', name: 'Engenharia Y', region: 'Sul', sellerId: 'u3' },
]

export const generateMockVisits = (): Visit[] => {
  const visits: Visit[] = []
  const today = new Date()

  for (let i = 0; i < 400; i++) {
    const seller = mockUsers[Math.floor(Math.random() * 3) + 1]
    const isSaleVisit = Math.random() > 0.4
    const numItems = isSaleVisit ? Math.floor(Math.random() * 3) + 1 : 1
    const items: VisitItem[] = []

    for (let j = 0; j < numItems; j++) {
      const isItemSale = isSaleVisit ? Math.random() > 0.3 : false
      const result: VisitResult = isItemSale
        ? 'Venda'
        : Math.random() > 0.5
          ? 'Sem Venda'
          : 'Agendamento'

      items.push({
        id: `vi-${i}-${j}`,
        industryId: mockIndustries[Math.floor(Math.random() * mockIndustries.length)].id,
        result,
        value: isItemSale ? Math.floor(Math.random() * 8000) + 500 : undefined,
      })
    }

    visits.push({
      id: `v${i}`,
      date: formatISO(subDays(today, Math.floor(Math.random() * 60))),
      sellerId: seller.id,
      clientId: mockClients[Math.floor(Math.random() * mockClients.length)].id,
      notes: isSaleVisit
        ? 'Visita produtiva, múltiplos orçamentos aprovados.'
        : 'Apenas prospecção.',
      items,
    })
  }

  return visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const mockVisits = generateMockVisits()
