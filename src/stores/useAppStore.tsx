import React, { createContext, useContext, useState, ReactNode } from 'react'
import { mockUsers, mockClients, mockIndustries, mockVisits } from '@/lib/mockData'
import type { User, Client, Industry, Visit } from '@/lib/types'

interface AppState {
  currentUser: User
  users: User[]
  clients: Client[]
  industries: Industry[]
  visits: Visit[]
  setCurrentUser: (id: string) => void
  addVisit: (visit: Visit) => void
  importVisits: (newVisits: Visit[]) => void
}

const AppContext = createContext<AppState | null>(null)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [users] = useState<User[]>(mockUsers)
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]) // Starts as Gestor
  const [clients] = useState<Client[]>(mockClients)
  const [industries] = useState<Industry[]>(mockIndustries)
  const [visits, setVisits] = useState<Visit[]>(mockVisits)

  const handleSetCurrentUser = (id: string) => {
    const user = users.find((u) => u.id === id)
    if (user) setCurrentUser(user)
  }

  const addVisit = (visit: Visit) => {
    setVisits((prev) => [visit, ...prev])
  }

  const importVisits = (newVisits: Visit[]) => {
    setVisits((prev) => {
      const existingIds = new Set(prev.map((v) => v.externalId).filter(Boolean))
      const uniqueNew = newVisits.filter((v) => !v.externalId || !existingIds.has(v.externalId))
      return [...uniqueNew, ...prev]
    })
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
        setCurrentUser: handleSetCurrentUser,
        addVisit,
        importVisits,
      },
    },
    children,
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider')
  }
  return context
}
