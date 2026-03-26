/**
 * Persistent API Layer
 * Simulates a relational database backend.
 */

export const api = {
  get: <T>(endpoint: string): T[] => {
    if (endpoint === 'Clientes') {
      console.warn('api.get("Clientes") is deprecated. Use clientsDbApi instead.')
      return []
    }
    try {
      const data = localStorage.getItem(`db_${endpoint}`)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  post: <T>(endpoint: string, item: T): T => {
    if (endpoint === 'Clientes') throw new Error('Use clientsDbApi instead.')
    const data = api.get<T>(endpoint)
    data.push(item)
    localStorage.setItem(`db_${endpoint}`, JSON.stringify(data))
    return item
  },

  put: <T extends { id: string }>(endpoint: string, id: string, item: Partial<T>): T => {
    if (endpoint === 'Clientes') throw new Error('Use clientsDbApi instead.')
    const data = api.get<T>(endpoint)
    const index = data.findIndex((i: any) => i.id === id)
    if (index !== -1) {
      data[index] = { ...data[index], ...item }
      localStorage.setItem(`db_${endpoint}`, JSON.stringify(data))
      return data[index]
    }
    throw new Error(`Record with id ${id} not found in ${endpoint}`)
  },

  delete: (endpoint: string, id: string): void => {
    if (endpoint === 'Clientes') throw new Error('Use clientsDbApi instead.')
    const data = api.get<{ id: string }>(endpoint)
    const filtered = data.filter((i) => i.id !== id)
    localStorage.setItem(`db_${endpoint}`, JSON.stringify(filtered))
  },

  postBatch: <T>(endpoint: string, items: T[]): T[] => {
    if (endpoint === 'Clientes') throw new Error('Use clientsDbApi instead.')
    const data = api.get<T>(endpoint)
    const newData = [...data, ...items]
    localStorage.setItem(`db_${endpoint}`, JSON.stringify(newData))
    return items
  },
}

export const configApi = {
  get: (key: string, defaultVal: string = ''): string => {
    return localStorage.getItem(`config_${key}`) ?? defaultVal
  },
  set: (key: string, val: string): void => {
    localStorage.setItem(`config_${key}`, val)
  },
}

// --- NEW ASYNC DATABASE API FOR CLIENTS ---
// This implements a robust API wrapper for database persistence.
// When the real backend isn't available, it falls back to IndexedDB to keep the prototype working,
// preserving state across reloads and cache clears.

const DB_VERSION = 1
const DB_NAME = 'AsafEnterpriseDB'
const STORE_CLIENTS = 'clientes_collection'

const getIDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_CLIENTS)) {
        db.createObjectStore(STORE_CLIENTS, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

const idb = {
  getAll: async <T>(): Promise<T[]> => {
    const db = await getIDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CLIENTS, 'readonly')
      const store = tx.objectStore(STORE_CLIENTS)
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  },
  put: async <T>(item: T): Promise<void> => {
    const db = await getIDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CLIENTS, 'readwrite')
      const store = tx.objectStore(STORE_CLIENTS)
      const req = store.put(item)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  },
  putBatch: async <T>(items: T[]): Promise<void> => {
    const db = await getIDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CLIENTS, 'readwrite')
      const store = tx.objectStore(STORE_CLIENTS)
      items.forEach((item) => store.put(item))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },
}

// Clean up legacy localStorage dependencies
try {
  const legacyClientsRaw = localStorage.getItem('db_Clientes')
  if (legacyClientsRaw) {
    const legacyClients = JSON.parse(legacyClientsRaw)
    if (Array.isArray(legacyClients) && legacyClients.length > 0) {
      idb.putBatch(legacyClients).catch(() => {})
    }
    localStorage.removeItem('db_Clientes')
  }
} catch (e) {
  // Silent ignore for migration
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/mock-api/v1'

export const clientsDbApi = {
  getAll: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/clientes`)
      if (res.ok) return await res.json()
      throw new Error('Backend unavailable')
    } catch (e) {
      return await idb.getAll()
    }
  },
  insert: async (client: any): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      })
      if (res.ok) return await res.json()
      throw new Error('Backend unavailable')
    } catch (e) {
      await idb.put(client)
      return client
    }
  },
  insertBatch: async (clients: any[]): Promise<any[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/clientes/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clients }),
      })
      if (res.ok) return await res.json()
      throw new Error('Backend unavailable')
    } catch (e) {
      await idb.putBatch(clients)
      return clients
    }
  },
  update: async (id: string, client: any): Promise<any> => {
    try {
      const res = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      })
      if (res.ok) return await res.json()
      throw new Error('Backend unavailable')
    } catch (e) {
      await idb.put(client)
      return client
    }
  },
}
