import { createClientsBatch } from '@/services/clients'
import { Client } from '@/lib/types'

export const migrateLocalClientsToPB = async () => {
  if (localStorage.getItem('pb_clients_migrated') === 'true') return

  try {
    let localClients: Client[] = []

    // 1. Try localStorage fallback
    const legacyClientsRaw = localStorage.getItem('db_Clientes')
    if (legacyClientsRaw) {
      try {
        const parsed = JSON.parse(legacyClientsRaw)
        if (Array.isArray(parsed)) localClients = parsed
      } catch (e) {
        // Ignore JSON parse error and fallback to empty array
      }
    }

    // 2. Try IndexedDB
    if (localClients.length === 0) {
      localClients = await new Promise((resolve) => {
        try {
          const req = indexedDB.open('AsafEnterpriseDB', 1)
          req.onsuccess = () => {
            const db = req.result
            if (!db.objectStoreNames.contains('clientes_collection')) {
              resolve([])
              return
            }
            const tx = db.transaction('clientes_collection', 'readonly')
            const store = tx.objectStore('clientes_collection')
            const getReq = store.getAll()
            getReq.onsuccess = () => resolve(getReq.result || [])
            getReq.onerror = () => resolve([])
          }
          req.onerror = () => resolve([])
        } catch {
          resolve([])
        }
      })
    }

    if (localClients && localClients.length > 0) {
      console.log(`Migrating ${localClients.length} clients to PocketBase...`)
      await createClientsBatch(localClients)
      console.log('Migration successful.')
    }

    localStorage.removeItem('db_Clientes')
    localStorage.setItem('pb_clients_migrated', 'true')
  } catch (err) {
    console.error('Migration failed:', err)
  }
}
