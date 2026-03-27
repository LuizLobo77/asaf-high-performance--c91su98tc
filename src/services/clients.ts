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
  }
}

export const getClients = async (): Promise<Client[]> => {
  const records = await pb.collection('clients').getFullList({ sort: '-created' })
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
  const chunks = []
  for (let i = 0; i < clients.length; i += 50) {
    chunks.push(clients.slice(i, i + 50))
  }
  for (const chunk of chunks) {
    await Promise.all(
      chunk.map((c) => {
        const payload = {
          name: c.name,
          cnpj: c.cnpj,
          city: c.city,
          region: c.region,
          status: c.status || 'active',
          sellerId: c.sellerId,
          lastPurchase: c.lastPurchase,
        }
        Object.keys(payload).forEach(
          (key) =>
            payload[key as keyof typeof payload] === undefined &&
            delete payload[key as keyof typeof payload],
        )
        return pb.collection('clients').create(payload)
      }),
    )
  }
}
