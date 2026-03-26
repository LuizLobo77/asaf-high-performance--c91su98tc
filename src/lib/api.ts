/**
 * Persistent API Layer
 * Simulates a relational database backend with GET, POST, PUT, DELETE operations.
 * Utilizes client-side persistent storage to ensure data remains visible after a
 * browser refresh and is preserved when the application is redeployed.
 */

export const api = {
  get: <T>(endpoint: string): T[] => {
    try {
      const data = localStorage.getItem(`db_${endpoint}`)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  },

  post: <T>(endpoint: string, item: T): T => {
    const data = api.get<T>(endpoint)
    data.push(item)
    localStorage.setItem(`db_${endpoint}`, JSON.stringify(data))
    return item
  },

  put: <T extends { id: string }>(endpoint: string, id: string, item: Partial<T>): T => {
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
    const data = api.get<{ id: string }>(endpoint)
    const filtered = data.filter((i) => i.id !== id)
    localStorage.setItem(`db_${endpoint}`, JSON.stringify(filtered))
  },

  postBatch: <T>(endpoint: string, items: T[]): T[] => {
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
