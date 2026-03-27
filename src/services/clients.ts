import pb from '@/lib/pocketbase/client'
import { Client } from '@/lib/types'

export function mapRecordToClient(record: any): Client {
  return {
    id: record.id,
    name: record.name || '',
    cnpj: record.cnpj || '',
    city: record.city || '',
    region: record.region || '',
    status: record.status || 'active',
    lastPurchase: record.lastPurchase,
    sellerId: record.sellerId || '',
    deletedAt: record.deletedAt,
  }
}

export const getClients = async (): Promise<Client[]> => {
  const records = await pb.collection('clients').getFullList({
    sort: '-created',
  })
  return records.map(mapRecordToClient)
}

export const createClient = async (data: Partial<Client>): Promise<Client> => {
  const payload = {
    name: data.name,
    cnpj: data.cnpj,
    city: data.city,
    region: data.region,
    status: data.status || 'active',
    sellerId: data.sellerId,
    lastPurchase: data.lastPurchase,
    deletedAt: data.deletedAt,
  }
  Object.keys(payload).forEach(
    (key) =>
      payload[key as keyof typeof payload] === undefined &&
      delete payload[key as keyof typeof payload],
  )

  const record = await pb.collection('clients').create(payload)
  return mapRecordToClient(record)
}

export const updateClient = async (id: string, data: Partial<Client>): Promise<Client> => {
  const payload = {
    name: data.name,
    cnpj: data.cnpj,
    city: data.city,
    region: data.region,
    status: data.status,
    sellerId: data.sellerId,
    lastPurchase: data.lastPurchase,
    deletedAt: data.deletedAt,
  }
  Object.keys(payload).forEach(
    (key) =>
      payload[key as keyof typeof payload] === undefined &&
      delete payload[key as keyof typeof payload],
  )

  const record = await pb.collection('clients').update(id, payload)
  return mapRecordToClient(record)
}

export const deleteClient = async (id: string): Promise<void> => {
  await pb.collection('clients').delete(id)
}

export const createClientsBatch = async (clients: Partial<Client>[]): Promise<void> => {
  const chunkSize = 5 // Process in smaller batches to avoid rate limiting (429 Too Many Requests)

  for (let i = 0; i < clients.length; i += chunkSize) {
    const chunk = clients.slice(i, i + chunkSize)

    // Use Promise.allSettled to ensure one failure doesn't halt the entire chunk
    await Promise.allSettled(
      chunk.map(async (c) => {
        const payload = {
          name: c.name,
          cnpj: c.cnpj,
          city: c.city,
          region: c.region,
          status: c.status || 'active',
          sellerId: c.sellerId,
          lastPurchase: c.lastPurchase,
          deletedAt: c.deletedAt,
        }

        Object.keys(payload).forEach(
          (key) =>
            payload[key as keyof typeof payload] === undefined &&
            delete payload[key as keyof typeof payload],
        )

        try {
          return await pb.collection('clients').create(payload)
        } catch (error) {
          console.error(`Failed to create client ${c.name} in batch:`, error)
          throw error
        }
      }),
    )

    // Add a controlled delay between batches to respect backend rate limits
    if (i + chunkSize < clients.length) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  }
}
