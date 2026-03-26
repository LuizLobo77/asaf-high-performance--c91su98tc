import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  mockUsers,
  mockClients,
  mockIndustries,
  mockVisits,
  mockCommissionRules,
} from '@/lib/mockData'
import type { User, Client, Industry, Visit, CommissionRule } from '@/lib/types'

interface AppState {
  currentUser: User
  users: User[]
  clients: Client[]
  industries: Industry[]
  visits: Visit[]
  commissionRules: CommissionRule[]
  logoUrl: string
  suasVendasApiKey: string
  lastSync: string | null
  setCurrentUser: (id: string) => void
  addUser: (user: User) => void
  updateUser: (id: string, user: Partial<User>) => void
  addVisit: (visit: Visit) => void
  importVisits: (newVisits: Visit[]) => void
  addIndustry: (industry: Industry) => void
  deleteIndustry: (id: string) => void
  setCommissionRule: (rule: CommissionRule) => void
  deleteCommissionRule: (id: string) => void
  setLogoUrl: (url: string) => void
  setSuasVendasApiKey: (key: string) => void
  syncSuasVendas: () => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]) // Starts as Gestor
  const [clients] = useState<Client[]>(mockClients)
  const [industries, setIndustries] = useState<Industry[]>(mockIndustries)
  const [visits, setVisits] = useState<Visit[]>(mockVisits)
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(mockCommissionRules)
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [suasVendasApiKey, setSuasVendasApiKey] = useState<string>('')
  const [lastSync, setLastSync] = useState<string | null>(null)

  const handleSetCurrentUser = (id: string) => {
    const user = users.find((u) => u.id === id)
    if (user) setCurrentUser(user)
  }

  const addUser = (user: User) => setUsers((prev) => [...prev, user])

  const updateUser = (id: string, partial: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...partial } : u)))
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...partial }))
    }
  }

  const addVisit = (visit: Visit) => setVisits((prev) => [visit, ...prev])

  const importVisits = (newVisits: Visit[]) => {
    setVisits((prev) => {
      const existingIds = new Set(prev.map((v) => v.externalId).filter(Boolean))
      const uniqueNew = newVisits.filter((v) => !v.externalId || !existingIds.has(v.externalId))
      return [...uniqueNew, ...prev]
    })
  }

  const addIndustry = (industry: Industry) => setIndustries((prev) => [...prev, industry])

  const deleteIndustry = (id: string) => setIndustries((prev) => prev.filter((i) => i.id !== id))

  const setCommissionRule = (rule: CommissionRule) => {
    setCommissionRules((prev) => {
      const exists = prev.find((r) => r.id === rule.id)
      if (exists) return prev.map((r) => (r.id === rule.id ? rule : r))
      return [...prev, rule]
    })
  }

  const deleteCommissionRule = (id: string) => {
    setCommissionRules((prev) => prev.filter((r) => r.id !== id))
  }

  const syncSuasVendas = async () => {
    if (!suasVendasApiKey) {
      throw new Error('Configure a API Key primeiro.')
    }
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const { generateMockVisits } = await import('@/lib/mockData')
    const externalVisits = generateMockVisits()
      .slice(0, 10)
      .map((v) => ({
        ...v,
        id: `sv-${Date.now()}-${Math.random()}`,
        externalId: `suasvendas-${Date.now()}-${Math.random()}`,
        date: new Date().toISOString(),
      }))

    importVisits(externalVisits)
    setLastSync(new Date().toISOString())
  }

  return React.createElement(
    AppContext.Provider,
    {
      value: {
        currentUser,
        users,
        clients,
        industries,
        visits,
        commissionRules,
        logoUrl,
        suasVendasApiKey,
        lastSync,
        setCurrentUser: handleSetCurrentUser,
        addUser,
        updateUser,
        addVisit,
        importVisits,
        addIndustry,
        deleteIndustry,
        setCommissionRule,
        deleteCommissionRule,
        setLogoUrl,
        setSuasVendasApiKey,
        syncSuasVendas,
      },
    },
    children,
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within an AppProvider')
  return context
}
