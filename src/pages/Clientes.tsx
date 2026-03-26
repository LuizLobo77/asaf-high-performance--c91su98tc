import { useState } from 'react'
import { Plus, Edit2, Ban, CheckCircle2, UploadCloud, DownloadCloud } from 'lucide-react'
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
  const { clients, users, currentUser, addClient, updateClient, importClients } = useAppStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
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
        region: formData.city, // maintain legacy field compat
        sellerId: sellerId,
      })
      toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso.' })
    } else {
      addClient({
        id: `c-${Date.now()}`,
        name: formData.name,
        cnpj: formData.cnpj,
        city: formData.city,
        region: formData.city, // maintain legacy field compat
        status: 'active',
        sellerId: sellerId,
      })
      toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso.' })
    }

    setIsModalOpen(false)
  }

  const downloadTemplate = () => {
    const headers = 'Razao_Social,CNPJ,Cidade\n'
    const blob = new Blob([headers], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'template_clientes.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Atenção',
        description: 'Por favor, envie um arquivo no formato CSV.',
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split(/\r?\n/).filter((l) => l.trim())
        if (lines.length < 2) throw new Error('Arquivo vazio ou sem dados.')

        let added = 0
        let skipped = 0
        const newClients: Client[] = []
        const existingCnpjs = new Set(clients.map((c) => c.cnpj).filter(Boolean))

        lines.slice(1).forEach((line, i) => {
          const parts = line.split(',')
          if (parts.length < 2) return

          const razaoSocial = parts[0]?.trim().replace(/^"|"$/g, '')
          const cnpjRaw = parts[1]?.trim().replace(/^"|"$/g, '')
          const cidade = parts[2] ? parts[2].trim().replace(/^"|"$/g, '') : ''

          if (!razaoSocial || !cnpjRaw) {
            skipped++
            return
          }

          const formattedCnpj = formatCNPJ(cnpjRaw)

          if (existingCnpjs.has(formattedCnpj)) {
            skipped++
          } else {
            existingCnpjs.add(formattedCnpj)
            newClients.push({
              id: `c-imp-${Date.now()}-${i}`,
              name: razaoSocial,
              cnpj: formattedCnpj,
              city: cidade,
              region: cidade,
              status: 'active',
              sellerId: currentUser.id,
            })
            added++
          }
        })

        if (newClients.length > 0) {
          importClients(newClients)
        }

        toast({
          title: 'Importação concluída',
          description: `${added} clientes adicionados, ${skipped} ignorados (CNPJ duplicado ou inválido).`,
        })
        setIsImportModalOpen(false)
      } catch (err) {
        toast({
          title: 'Erro na importação',
          description: 'O formato do arquivo é inválido ou ocorreu um erro na leitura.',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E40AF]">Clientes</h1>
          <p className="text-muted-foreground mt-1">Gestão da carteira de clientes cadastrados.</p>
        </div>
        <div className="flex gap-2">
          {currentUser.role === 'gestor' && (
            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
              <UploadCloud className="w-4 h-4 mr-2" /> Importar Planilha
            </Button>
          )}
          <Button onClick={() => openModal()} className="bg-[#1E40AF] hover:bg-[#1E40AF]/90">
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
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.cnpj || 'N/A'}</TableCell>
                  <TableCell>{client.city || client.region}</TableCell>
                  {currentUser.role === 'gestor' && (
                    <TableCell className="text-muted-foreground">
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
        <DialogContent className="sm:max-w-[425px]">
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
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#1E40AF] hover:bg-[#1E40AF]/90">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar Clientes</DialogTitle>
            <DialogDescription>
              Faça o upload de uma planilha CSV para importar clientes em massa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer
                ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  processFile(e.dataTransfer.files[0])
                }
              }}
              onClick={() => document.getElementById('csv-client-upload')?.click()}
            >
              <UploadCloud
                className={`w-12 h-12 mb-4 ${isDragging ? 'text-[#1E40AF] animate-bounce' : 'text-[#6B7280]'}`}
              />
              <h3 className="text-lg font-semibold text-[#1E40AF] mb-1">
                Arraste seu arquivo CSV aqui
              </h3>
              <p className="text-sm text-[#6B7280] mb-4 text-center">
                ou clique para procurar no seu computador
              </p>
              <Button variant="outline" className="pointer-events-none">
                Selecionar Arquivo
              </Button>
              <input
                type="file"
                id="csv-client-upload"
                className="hidden"
                accept=".csv,.xlsx"
                onChange={(e) => {
                  if (e.target.files?.[0]) processFile(e.target.files[0])
                  e.target.value = ''
                }}
              />
            </div>

            <div className="flex justify-center pt-2">
              <Button variant="link" onClick={downloadTemplate} className="text-[#1E40AF]">
                <DownloadCloud className="w-4 h-4 mr-2" />
                Baixar Planilha Modelo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
