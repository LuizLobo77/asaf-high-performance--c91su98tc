export type Role = 'gestor' | 'vendedor'
export type VisitResult = 'Venda' | 'Sem Venda' | 'Agendamento'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  target: number
}

export interface Client {
  id: string
  name: string
  region: string
  lastPurchase?: string
  sellerId: string
}

export interface Industry {
  id: string
  name: string
  commissionPercent: number
}

export interface Visit {
  id: string
  date: string
  sellerId: string
  clientId: string
  result: VisitResult
  value?: number
  industryId?: string
  notes?: string
  externalId?: string
}
