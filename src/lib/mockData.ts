import { subDays, formatISO } from 'date-fns'
import type { User, Client, Industry, Visit, VisitResult } from './types'

export const mockUsers: User[] = [
  { id: 'u1', name: 'Carlos Gestor', email: 'carlos@asaf.com', role: 'gestor', target: 0 },
  { id: 'u2', name: 'Ana Vendedora', email: 'ana@asaf.com', role: 'vendedor', target: 150000 },
  { id: 'u3', name: 'João Silva', email: 'joao@asaf.com', role: 'vendedor', target: 120000 },
  { id: 'u4', name: 'Marcos Santos', email: 'marcos@asaf.com', role: 'vendedor', target: 100000 },
]

export const mockIndustries: Industry[] = [
  { id: 'i1', name: 'Ferragens Avançadas', commissionPercent: 0.05 },
  { id: 'i2', name: 'Tubos e Conexões S.A.', commissionPercent: 0.08 },
  { id: 'i3', name: 'Elétrica Brasil', commissionPercent: 0.06 },
  { id: 'i4', name: 'Ferramentas Pro', commissionPercent: 0.1 },
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

  for (let i = 0; i < 200; i++) {
    const isSale = Math.random() > 0.4
    const result: VisitResult = isSale ? 'Venda' : Math.random() > 0.5 ? 'Sem Venda' : 'Agendamento'
    const seller = mockUsers[Math.floor(Math.random() * 3) + 1] // Skip gestor
    const value = isSale ? Math.floor(Math.random() * 15000) + 1000 : undefined

    visits.push({
      id: `v${i}`,
      date: formatISO(subDays(today, Math.floor(Math.random() * 30))),
      sellerId: seller.id,
      clientId: mockClients[Math.floor(Math.random() * mockClients.length)].id,
      result,
      value,
      industryId: isSale
        ? mockIndustries[Math.floor(Math.random() * mockIndustries.length)].id
        : undefined,
      notes: isSale
        ? 'Pedido aprovado com sucesso.'
        : 'Cliente pediu para retornar semana que vem.',
    })
  }

  return visits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export const mockVisits = generateMockVisits()
