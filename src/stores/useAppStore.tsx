import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { mockUsers } from '@/lib/mockData'
import type { User, Client, Industry, Visit, CommissionRule, IndustryNote } from '@/lib/types'
import { api, configApi } from '@/lib/api'

// Initialize default administrator into the persistent DB if it's completely empty.
const initializeDb = () => {
  if (api.get('Vendedores').length === 0) {
    api.postBatch('Vendedores', mockUsers)
  }
}

initializeDb()

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
  importClients: (newClients: Client[]) => void
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
  // Loading all core entities from persistent storage matching the accepted database table names
  const [users, setUsers] = useState<User[]>(() => api.get('Vendedores'))
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('asaf_currentUser')
    return saved ? JSON.parse(saved) : null
  })
  const [clients, setClients] = useState<Client[]>(() => api.get('Clientes'))
  const [industries, setIndustries] = useState<Industry[]>(() => api.get('Industrias'))
  const [visits, setVisits] = useState<Visit[]>(() => api.get('Pedidos'))
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(() =>
    api.get('Regras_Comissao_Vendedor'),
  )
  const [industryNotes, setIndustryNotes] = useState<IndustryNote[]>(() =>
    api.get('Notas_Industria'),
  )

  const [logoUrl, setLogoUrlState] = useState<string>(() => configApi.get('logoUrl'))
  const [suasVendasApiKey, setSuasVendasApiKeyState] = useState<string>(() =>
    configApi.get('suasVendasApiKey'),
  )
  const [lastSync, setLastSyncState] = useState<string | null>(() => {
    const val = configApi.get('lastSync', '')
    return val || null
  })

  // Listen for storage changes to sync authentication state across tabs and in-app browsers
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'asaf_currentUser') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const saveCurrentUser = (user: User | null) => {
    setCurrentUser(user)
    if (user) {
      localStorage.setItem('asaf_currentUser', JSON.stringify(user))
    } else {
      localStorage.removeItem('asaf_currentUser')
    }
  }

  const setLogoUrl = (url: string) => {
    configApi.set('logoUrl', url)
    setLogoUrlState(url)
  }

  const setSuasVendasApiKey = (key: string) => {
    configApi.set('suasVendasApiKey', key)
    setSuasVendasApiKeyState(key)
  }

  const login = (email: string, pass?: string) => {
    const user = users.find((u) => u.email === email && u.password === pass)
    if (user) {
      if (user.status === 'inactive') {
        throw new Error('Conta inativa. Acesso bloqueado.')
      }
      if (user.mustChangePassword) {
        return { success: false, requireChange: true, user }
      }
      saveCurrentUser(user)
      return { success: true }
    }
    return { success: false }
  }

  const logout = () => {
    saveCurrentUser(null)
  }

  const forceLogin = (user: User) => {
    saveCurrentUser(user)
  }

  const addUser = (user: User) => {
    api.post('Vendedores', user)
    setUsers((prev) => [...prev, user])
  }

  const updateUser = (id: string, partial: Partial<User>) => {
    api.put('Vendedores', id, partial)
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...partial } : u)))
    if (currentUser?.id === id) {
      const updated = { ...currentUser, ...partial }
      saveCurrentUser(updated)
    }
  }

  const addClient = (client: Client) => {
    api.post('Clientes', client)
    setClients((prev) => [...prev, client])
  }

  const updateClient = (id: string, partial: Partial<Client>) => {
    api.put('Clientes', id, partial)
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...partial } : c)))
  }

  const deleteClient = (id: string) => {
    api.put('Clientes', id, { status: 'inactive' })
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'inactive' } : c)))
  }

  const importClients = (newClients: Client[]) => {
    api.postBatch('Clientes', newClients)
    setClients((prev) => [...prev, ...newClients])
  }

  const addVisit = (visit: Visit) => {
    api.post('Pedidos', visit)
    setVisits((prev) => [visit, ...prev])
  }

  const importVisits = (newVisits: Visit[]) => {
    setVisits((prev) => {
      const existingIds = new Set(prev.map((v) => v.externalId).filter(Boolean))
      const uniqueNew = newVisits.filter((v) => !v.externalId || !existingIds.has(v.externalId))
      if (uniqueNew.length > 0) {
        api.postBatch('Pedidos', uniqueNew)
      }
      return [...uniqueNew, ...prev]
    })
  }

  const addIndustry = (industry: Industry) => {
    const newInd = { ...industry, status: 'active' as const }
    api.post('Industrias', newInd)
    setIndustries((prev) => [...prev, newInd])
  }

  const updateIndustry = (id: string, partial: Partial<Industry>) => {
    api.put('Industrias', id, partial)
    setIndustries((prev) => prev.map((i) => (i.id === id ? { ...i, ...partial } : i)))
  }

  const deleteIndustry = (id: string) => {
    api.put('Industrias', id, { status: 'inactive' })
    setIndustries((prev) => prev.map((i) => (i.id === id ? { ...i, status: 'inactive' } : i)))
  }

  const setCommissionRule = (rule: CommissionRule) => {
    setCommissionRules((prev) => {
      const exists = prev.find((r) => r.id === rule.id)
      if (exists) {
        api.put('Regras_Comissao_Vendedor', rule.id, rule)
        return prev.map((r) => (r.id === rule.id ? rule : r))
      }
      api.post('Regras_Comissao_Vendedor', rule)
      return [...prev, rule]
    })
  }

  const deleteCommissionRule = (id: string) => {
    api.delete('Regras_Comissao_Vendedor', id)
    setCommissionRules((prev) => prev.filter((r) => r.id !== id))
  }

  const addIndustryNote = (note: Omit<IndustryNote, 'id' | 'date'>) => {
    const newNote = { ...note, id: `note-${Date.now()}`, date: new Date().toISOString() }
    api.post('Notas_Industria', newNote)
    setIndustryNotes((prev) => [...prev, newNote])
  }

  const syncSuasVendas = async () => {
    if (!suasVendasApiKey) {
      throw new Error('Configure a API Key primeiro.')
    }
    // Mock API sync delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const now = new Date().toISOString()
    configApi.set('lastSync', now)
    setLastSyncState(now)
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
        importClients,
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
