import { useState } from 'react'
import { Plus, Edit2, Ban, CheckCircle2, Users } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { Client } from '@/lib/types'

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18)
}

export default function Clientes() {
  const { clients, users, currentUser, addClient, updateClient } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const [selectedClientIds, setSelectedClientIds] = useState<Set<string>>(new Set())
  const [isBulkAssignModalOpen, setIsBulkAssignModalOpen] = useState(false)
  const [bulkSellerId, setBulkSellerId] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    city: '',
    sellerId: '',
  })

  if (!currentUser) return null

  const displayClients =
    currentUser.role === 'gestor'
      ? clients
      : clients.filter((c) => c.sellerId === currentUser.id || !c.sellerId)

  const sellers = users.filter((u) => u.role === 'vendedor')

  const getSellerName = (id: string) => users.find((u) => u.id === id)?.name || 'N/A'

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        cnpj: client.cnpj || '',
        city: client.city || '',
        sellerId: client.sellerId || 'unassigned',
      })
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        cnpj: '',
        city: '',
        sellerId: currentUser.role === 'vendedor' ? currentUser.id : 'unassigned',
      })
    }
    setIsModalOpen(true)
  }

  const handleToggleStatus = (client: Client) => {
    const newStatus = client.status === 'inactive' ? 'active' : 'inactive'
    updateClient(client.id, { status: newStatus })
    toast({
      title: 'Status Atualizado',
      description: `Cliente ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso.`,
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClientIds(new Set(displayClients.map((c) => c.id)))
    } else {
      setSelectedClientIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedClientIds)
    if (checked) newSet.add(id)
    else newSet.delete(id)
    setSelectedClientIds(newSet)
  }

  const handleBulkAssign = () => {
    if (!bulkSellerId) return
    selectedClientIds.forEach((id) => {
      updateClient(id, { sellerId: bulkSellerId })
    })
    toast({
      title: 'Sucesso',
      description: `${selectedClientIds.size} clientes atribuídos com sucesso.`,
    })
    setIsBulkAssignModalOpen(false)
    setSelectedClientIds(new Set())
    setBulkSellerId('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.cnpj || !formData.city) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    if (formData.cnpj.length < 18) {
      toast({
        title: 'Atenção',
        description: 'CNPJ incompleto ou inválido.',
        variant: 'destructive',
      })
      return
    }

    const finalSellerId =
      currentUser.role === 'gestor'
        ? formData.sellerId === 'unassigned'
          ? ''
          : formData.sellerId
        : currentUser.id

    const isDuplicate = clients.some((c) => c.cnpj === formData.cnpj && c.id !== editingClient?.id)
    if (isDuplicate) {
      toast({
        title: 'Atenção',
        description: 'Este CNPJ já está cadastrado no sistema.',
        variant: 'destructive',
      })
      return
    }

    if (editingClient) {
      updateClient(editingClient.id, {
        name: formData.name,
        cnpj: formData.cnpj,
        city: formData.city,
        region: formData.city,
        sellerId: finalSellerId,
      })
      toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso.' })
    } else {
      addClient({
        id: `c-${Date.now()}`,
        name: formData.name,
        cnpj: formData.cnpj,
        city: formData.city,
        region: formData.city,
        status: 'active',
        sellerId: finalSellerId,
      })
      toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso.' })
    }

    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E40AF]">Clientes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestão da carteira de clientes cadastrados.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {currentUser.role === 'gestor' && selectedClientIds.size > 0 && (
            <Button
              variant="outline"
              className="w-full sm:w-auto text-[#1E40AF] border-[#1E40AF] hover:bg-[#1E40AF]/10"
              onClick={() => setIsBulkAssignModalOpen(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Atribuir Vendedor ({selectedClientIds.size})
            </Button>
          )}
          <Button
            onClick={() => openModal()}
            className="w-full sm:w-auto bg-[#1E40AF] hover:bg-[#1E40AF]/90"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Cliente
          </Button>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Total de {displayClients.length} clientes na base.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {currentUser.role === 'gestor' && (
                  <TableHead className="w-[40px] px-4">
                    <Checkbox
                      checked={
                        displayClients.length > 0 &&
                        selectedClientIds.size === displayClients.length
                      }
                      onCheckedChange={(checked) => handleSelectAll(!!checked)}
                      aria-label="Selecionar todos"
                    />
                  </TableHead>
                )}
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cidade</TableHead>
                {currentUser.role === 'gestor' && <TableHead>Vendedor</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayClients.map((client) => (
                <TableRow key={client.id}>
                  {currentUser.role === 'gestor' && (
                    <TableCell className="px-4">
                      <Checkbox
                        checked={selectedClientIds.has(client.id)}
                        onCheckedChange={(checked) => handleSelectOne(client.id, !!checked)}
                        aria-label={`Selecionar ${client.name}`}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium min-w-[150px]">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <span>{client.name}</span>
                      {!client.sellerId && (
                        <Badge
                          variant="outline"
                          className="w-fit text-amber-600 border-amber-500/50 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 text-[10px] px-1.5 py-0 h-5"
                        >
                          Carteira Livre
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-[160px]">{client.cnpj || 'N/A'}</TableCell>
                  <TableCell className="min-w-[120px]">{client.city || client.region}</TableCell>
                  {currentUser.role === 'gestor' && (
                    <TableCell className="text-muted-foreground min-w-[150px]">
                      {client.sellerId ? (
                        getSellerName(client.sellerId)
                      ) : (
                        <span className="text-amber-600 font-medium">Sem Dono</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge
                      variant={client.status === 'inactive' ? 'secondary' : 'outline'}
                      className={
                        client.status === 'inactive'
                          ? ''
                          : 'border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400'
                      }
                    >
                      {client.status === 'inactive' ? 'Inativo' : 'Ativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openModal(client)}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(client)}
                      title={client.status === 'inactive' ? 'Ativar' : 'Desativar'}
                      className={
                        client.status === 'inactive'
                          ? 'text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/50'
                          : 'text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50'
                      }
                    >
                      {client.status === 'inactive' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Ban className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {displayClients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={currentUser.role === 'gestor' ? 7 : 5}
                    className="text-center text-muted-foreground py-8"
                  >
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para {editingClient ? 'atualizar' : 'cadastrar'} o cliente.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Razão Social *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome da Empresa LTDA"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ex: São Paulo - SP"
                required
              />
            </div>
            {currentUser.role === 'gestor' && (
              <div className="space-y-2">
                <Label htmlFor="sellerId">Vendedor Responsável</Label>
                <Select
                  value={formData.sellerId}
                  onValueChange={(val) => setFormData({ ...formData, sellerId: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Nenhum (Carteira Livre)</SelectItem>
                    {sellers.map((seller) => (
                      <SelectItem key={seller.id} value={seller.id}>
                        {seller.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto bg-[#1E40AF] hover:bg-[#1E40AF]/90">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkAssignModalOpen} onOpenChange={setIsBulkAssignModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Atribuir Vendedor</DialogTitle>
            <DialogDescription>
              Selecione o vendedor para assumir os {selectedClientIds.size} clientes selecionados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="bulkSellerId">Vendedor</Label>
              <Select value={bulkSellerId} onValueChange={setBulkSellerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((seller) => (
                    <SelectItem key={seller.id} value={seller.id}>
                      {seller.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBulkAssignModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleBulkAssign}
                className="w-full sm:w-auto bg-[#1E40AF] hover:bg-[#1E40AF]/90"
                disabled={!bulkSellerId}
              >
                Confirmar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
