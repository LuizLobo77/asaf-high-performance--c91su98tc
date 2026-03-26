import type { User, Client, Industry, Visit, CommissionRule } from './types'

// Purged all mock data except for one primary administrator to allow access to the clean slate environment.
export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Administrador Asaf',
    email: 'carlos@asaf.com',
    role: 'gestor',
    target: 0,
    status: 'active',
    phone: '(11) 99999-0000',
    password: '123456',
  },
]

export const mockIndustries: Industry[] = []

export const mockCommissionRules: CommissionRule[] = []

export const mockClients: Client[] = []

export const generateMockVisits = (): Visit[] => {
  return []
}

export const mockVisits: Visit[] = []
