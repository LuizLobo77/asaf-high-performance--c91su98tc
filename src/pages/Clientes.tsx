import { useState } from 'react'
import { Plus, Edit2, Ban, CheckCircle2 } from 'lucide-react'
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

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    city: '',
    sellerId: '',
  })

  if (!currentUser) return null

  const displayClients =
    currentUser.role === 'gestor' ? clients : clients.filter((c) => c.sellerId === currentUser.id)

  const sellers = users.filter((u) => u.role === 'vendedor')

  const getSellerName = (id: string) => users.find((u) => u.id === id)?.name || 'N/A'

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        cnpj: client.cnpj || '',
        city: client.city || '',
        sellerId: client.sellerId,
      })
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        cnpj: '',
        city: '',
        sellerId: currentUser.role === 'vendedor' ? currentUser.id : '',
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

    const sellerId = currentUser.role === 'gestor' ? formData.sellerId : currentUser.id

    if (!sellerId) {
      toast({
        title: 'Atenção',
        description: 'Selecione um vendedor responsável.',
        variant: 'destructive',
      })
      return
    }

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
        sellerId: sellerId,
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
        sellerId: sellerId,
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
        <div className="flex gap-2 w-full sm:w-auto">
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
                  <TableCell className="font-medium min-w-[150px]">{client.name}</TableCell>
                  <TableCell className="min-w-[160px]">{client.cnpj || 'N/A'}</TableCell>
                  <TableCell className="min-w-[120px]">{client.city || client.region}</TableCell>
                  {currentUser.role === 'gestor' && (
                    <TableCell className="text-muted-foreground min-w-[150px]">
                      {getSellerName(client.sellerId)}
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
                    colSpan={currentUser.role === 'gestor' ? 6 : 5}
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
                <Label htmlFor="sellerId">Vendedor Responsável *</Label>
                <Select
                  value={formData.sellerId}
                  onValueChange={(val) => setFormData({ ...formData, sellerId: val })}
                >
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
    </div>
  )
}
