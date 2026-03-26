export type Role = 'gestor' | 'vendedor'
export type VisitResult = 'Venda' | 'Sem Venda' | 'Agendamento'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  target: number
  phone?: string
  status?: 'active' | 'inactive'
  password?: string
  mustChangePassword?: boolean
}

export interface Client {
  id: string
  name: string
  cnpj?: string
  city?: string
  region: string
  status?: 'active' | 'inactive'
  lastPurchase?: string
  sellerId: string
}

export interface Industry {
  id: string
  name: string
  commissionPercent: number
  status?: 'active' | 'inactive'
}

export interface CommissionRule {
  id: string
  sellerId: string
  industryId: string
  splitPercent: number
}

export interface VisitItem {
  id: string
  industryId: string
  result: VisitResult
  value?: number
  commissionSnapshot?: number // Saved as a static snapshot at the time of order creation
}

export interface Visit {
  id: string
  date: string
  sellerId: string
  clientId: string
  items: VisitItem[]
  notes?: string
  externalId?: string
}

export interface IndustryNote {
  id: string
  industryId: string
  period: string
  note: string
  date: string
}
