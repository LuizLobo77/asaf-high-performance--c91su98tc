import React, { createContext, useContext, useState, ReactNode } from 'react'
import {
  mockUsers,
  mockClients,
  mockIndustries,
  mockVisits,
  mockCommissionRules,
} from '@/lib/mockData'
import type { User, Client, Industry, Visit, CommissionRule, IndustryNote } from '@/lib/types'

interface AppState {
  currentUser: User | null
  users: User[]
  clients: Client[]
  industries: Industry[]
  visits: Visit[]
  commissionRules: CommissionRule[]
  industryNotes: IndustryNote[]
  logoUrl: string
  suasVendasApiKey: string
  lastSync: string | null
  login: (
    email: string,
    password?: string,
  ) => { success: boolean; requireChange?: boolean; user?: User }
  logout: () => void
  forceLogin: (user: User) => void
  addUser: (user: User) => void
  updateUser: (id: string, user: Partial<User>) => void
  addClient: (client: Client) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void
  addVisit: (visit: Visit) => void
  importVisits: (newVisits: Visit[]) => void
  addIndustry: (industry: Industry) => void
  updateIndustry: (id: string, industry: Partial<Industry>) => void
  deleteIndustry: (id: string) => void
  setCommissionRule: (rule: CommissionRule) => void
  deleteCommissionRule: (id: string) => void
  addIndustryNote: (note: Omit<IndustryNote, 'id' | 'date'>) => void
  setLogoUrl: (url: string) => void
  setSuasVendasApiKey: (key: string) => void
  syncSuasVendas: () => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [industries, setIndustries] = useState<Industry[]>(mockIndustries)
  const [visits, setVisits] = useState<Visit[]>(mockVisits)
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(mockCommissionRules)
  const [industryNotes, setIndustryNotes] = useState<IndustryNote[]>([])
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [suasVendasApiKey, setSuasVendasApiKey] = useState<string>('')
  const [lastSync, setLastSync] = useState<string | null>(null)

  const login = (email: string, pass?: string) => {
    const user = users.find((u) => u.email === email && u.password === pass)
    if (user) {
      if (user.status === 'inactive') {
        throw new Error('Conta inativa. Acesso bloqueado.')
      }
      if (user.mustChangePassword) {
        return { success: false, requireChange: true, user }
      }
      setCurrentUser(user)
      return { success: true }
    }
    return { success: false }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const forceLogin = (user: User) => {
    setCurrentUser(user)
  }

  const addUser = (user: User) => setUsers((prev) => [...prev, user])

  const updateUser = (id: string, partial: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...partial } : u)))
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...partial } : null))
    }
  }

  const addClient = (client: Client) => {
    setClients((prev) => [...prev, client])
  }

  const updateClient = (id: string, partial: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)))
  }

  const deleteClient = (id: string) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'inactive' } : c)))
  }

  const addVisit = (visit: Visit) => setVisits((prev) => [visit, ...prev])

  const importVisits = (newVisits: Visit[]) => {
    setVisits((prev) => {
      const existingIds = new Set(prev.map((v) => v.externalId).filter(Boolean))
      const uniqueNew = newVisits.filter((v) => !v.externalId || !existingIds.has(v.externalId))
      return [...uniqueNew, ...prev]
    })
  }

  const addIndustry = (industry: Industry) =>
    setIndustries((prev) => [...prev, { ...industry, status: 'active' }])

  const updateIndustry = (id: string, partial: Partial<Industry>) => {
    setIndustries((prev) => prev.map((i) => (i.id === id ? { ...i, ...partial } : i)))
  }

  const deleteIndustry = (id: string) => {
    setIndustries((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'inactive' } : i)))
  }

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

  const addIndustryNote = (note: Omit<IndustryNote, 'id' | 'date'>) => {
    setIndustryNotes((prev) => [
      ...prev,
      { ...note, id: `note-${Date.now()}`, date: new Date().toISOString() },
    ])
  }

  const syncSuasVendas = async () => {
    if (!suasVendasApiKey) {
      throw new Error('Configure a API Key primeiro.')
    }
    await new Promise((resolve) => setTimeout(resolve, 1500))
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
        industryNotes,
        logoUrl,
        suasVendasApiKey,
        lastSync,
        login,
        logout,
        forceLogin,
        addUser,
        updateUser,
        addClient,
        updateClient,
        deleteClient,
        addVisit,
        importVisits,
        addIndustry,
        updateIndustry,
        deleteIndustry,
        setCommissionRule,
        deleteCommissionRule,
        addIndustryNote,
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
