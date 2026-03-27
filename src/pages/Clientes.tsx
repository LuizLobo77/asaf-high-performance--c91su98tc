import { useState, useMemo } from 'react'
import { Plus, Search, Trash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import useAppStore from '@/stores/useAppStore'
import { Client } from '@/lib/types'
import { ClientTable } from '@/components/clients/ClientTable'
import { ClientFormModal } from '@/components/clients/ClientFormModal'
import { ClientDeleteModal } from '@/components/clients/ClientDeleteModal'

export default function Clientes() {
  const { clients, currentUser, isClientsLoading } = useAppStore()

  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [formOpen, setFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)

  const isAdmin = currentUser?.role === 'Admin'

  const displayClients = useMemo(() => {
    let filtered = clients.filter((c) => {
      // Hide deleted clients unless showInactive is true
      if (!showInactive && c.deletedAt) return false

      if (search) {
        const q = search.toLowerCase()
        return c.name.toLowerCase().includes(q) || c.cnpj?.includes(q)
      }
      return true
    })

    // Vendedores can only see their own clients or unassigned ones
    if (!isAdmin) {
      filtered = filtered.filter((c) => c.sellerId === currentUser?.id || !c.sellerId)
    }

    return filtered
  }, [clients, search, showInactive, isAdmin, currentUser])

  const openForm = (client?: Client) => {
    setEditingClient(client || null)
    setFormOpen(true)
  }

  const openDelete = (client?: Client) => {
    setDeletingClient(client || null)
    setDeleteOpen(true)
  }

  if (!currentUser) return null

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E40AF]">Clientes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestão da carteira de clientes cadastrados.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {isAdmin && selected.size > 0 && (
            <Button
              variant="outline"
              className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={() => openDelete()}
            >
              <Trash className="w-4 h-4 mr-2" />
              Excluir Selecionados ({selected.size})
            </Button>
          )}
          <Button
            onClick={() => openForm()}
            className="w-full sm:w-auto bg-[#1E40AF] hover:bg-[#1E40AF]/90"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Cliente
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4 space-y-4">
          <div>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              Total de {isClientsLoading ? '...' : displayClients.length} clientes na visualização
              atual.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full justify-between">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por Razão Social ou CNPJ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {isAdmin && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-inactive"
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                />
                <Label htmlFor="show-inactive" className="cursor-pointer font-medium">
                  Mostrar Inativos
                </Label>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <ClientTable
            clients={displayClients}
            isLoading={isClientsLoading}
            isAdmin={isAdmin}
            selected={selected}
            onSelect={setSelected}
            onEdit={openForm}
            onDelete={openDelete}
          />
        </CardContent>
      </Card>

      {formOpen && (
        <ClientFormModal open={formOpen} onOpenChange={setFormOpen} client={editingClient} />
      )}

      {deleteOpen && (
        <ClientDeleteModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          client={deletingClient}
          selected={selected}
          onClearSelection={() => setSelected(new Set())}
        />
      )}
    </div>
  )
}
