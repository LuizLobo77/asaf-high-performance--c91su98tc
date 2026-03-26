import React, { createContext, useContext, useState, ReactNode } from 'react'
import { mockUsers, mockClients, mockIndustries, mockVisits } from '@/lib/mockData'
import type { User, Client, Industry, Visit } from '@/lib/types'

interface AppState {
  currentUser: User
  users: User[]
  clients: Client[]
  industries: Industry[]
  visits: Visit[]
  logoUrl: string
  suasVendasApiKey: string
  lastSync: string | null
  setCurrentUser: (id: string) => void
  addVisit: (visit: Visit) => void
  importVisits: (newVisits: Visit[]) => void
  addIndustry: (industry: Industry) => void
  deleteIndustry: (id: string) => void
  setLogoUrl: (url: string) => void
  setSuasVendasApiKey: (key: string) => void
  syncSuasVendas: () => Promise<void>
}

const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users] = useState<User[]>(mockUsers)
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]) // Starts as Gestor
  const [clients] = useState<Client[]>(mockClients)
  const [industries, setIndustries] = useState<Industry[]>(mockIndustries)
  const [visits, setVisits] = useState<Visit[]>(mockVisits)
  const [logoUrl, setLogoUrl] = useState<string>('')
  const [suasVendasApiKey, setSuasVendasApiKey] = useState<string>('')
  const [lastSync, setLastSync] = useState<string | null>(null)

  const handleSetCurrentUser = (id: string) => {
    const user = users.find((u) => u.id === id)
    if (user) setCurrentUser(user)
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
        logoUrl,
        suasVendasApiKey,
        lastSync,
        setCurrentUser: handleSetCurrentUser,
        addVisit,
        importVisits,
        addIndustry,
        deleteIndustry,
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
