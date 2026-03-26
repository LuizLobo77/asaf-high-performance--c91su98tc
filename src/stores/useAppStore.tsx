import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { mockUsers } from '@/lib/mockData'
import type { User, Client, Industry, Visit, CommissionRule, IndustryNote } from '@/lib/types'
import { api, configApi, clientsDbApi } from '@/lib/api'

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
  isClientsLoading: boolean
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
  addClient: (client: Client) => Promise<void>
  updateClient: (id: string, client: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  importClients: (newClients: Client[]) => Promise<void>
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
  const [users, setUsers] = useState<User[]>(() => api.get('Vendedores'))
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('asaf_currentUser')
    return saved ? JSON.parse(saved) : null
  })

  // Clients state is now initialized empty and populated asynchronously from the database API
  const [clients, setClients] = useState<Client[]>([])
  const [isClientsLoading, setIsClientsLoading] = useState(true)

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

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'asaf_currentUser') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Fetch clients asynchronously upon initialization
  useEffect(() => {
    clientsDbApi
      .getAll()
      .then((data) => setClients(data))
      .catch((err) => console.error('Failed to fetch clients from database:', err))
      .finally(() => setIsClientsLoading(false))
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

  const addClient = async (client: Client) => {
    await clientsDbApi.insert(client)
    setClients((prev) => [...prev, client])
  }

  const updateClient = async (id: string, partial: Partial<Client>) => {
    const existing = clients.find((c) => c.id === id)
    if (existing) {
      const updated = { ...existing, ...partial }
      await clientsDbApi.update(id, updated)
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)))
    }
  }

  const deleteClient = async (id: string) => {
    const existing = clients.find((c) => c.id === id)
    if (existing) {
      const updated = { ...existing, status: 'inactive' as const }
      await clientsDbApi.update(id, updated)
      setClients((prev) => prev.map((c) => (c.id === id ? updated : c)))
    }
  }

  const importClients = async (newClients: Client[]) => {
    await clientsDbApi.insertBatch(newClients)
    setClients((prev) => {
      const existingIds = new Set(prev.map((c) => c.id))
      const uniqueNew = newClients.filter((c) => !existingIds.has(c.id))
      return [...prev, ...uniqueNew]
    })
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
        isClientsLoading,
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
