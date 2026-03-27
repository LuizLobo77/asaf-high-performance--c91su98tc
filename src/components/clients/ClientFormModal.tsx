import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Client } from '@/lib/types'
import useAppStore from '@/stores/useAppStore'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
}

const formatCNPJ = (v: string) =>
  v
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18)

export function ClientFormModal({ open, onOpenChange, client }: Props) {
  const { addClient, updateClient, users, currentUser } = useAppStore()
  const isAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'gestor'
  const sellers = users.filter((u) => u.role === 'vendedor')

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    city: '',
    region: '',
    sellerId: '',
  })

  useEffect(() => {
    if (open) {
      setFormData({
        name: client?.name || '',
        cnpj: client?.cnpj || '',
        city: client?.city || '',
        region: client?.region || '',
        sellerId:
          client?.sellerId || (currentUser?.role === 'vendedor' ? currentUser.id : 'unassigned'),
      })
    }
  }, [open, client, currentUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      return toast({
        title: 'Atenção',
        description: 'A Razão Social é obrigatória.',
        variant: 'destructive',
      })
    }

    try {
      const payload = {
        name: formData.name,
        cnpj: formData.cnpj,
        city: formData.city,
        region: formData.region,
        sellerId: formData.sellerId === 'unassigned' ? '' : formData.sellerId,
      }

      if (client) {
        await updateClient(client.id, payload)
        toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso.' })
      } else {
        await addClient({
          id: `c-${Date.now()}`,
          ...payload,
          status: 'active',
        })
        toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso.' })
      }
      onOpenChange(false)
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao salvar as informações do cliente.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-lg">
        <DialogHeader>
          <DialogTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para {client ? 'atualizar' : 'cadastrar'} o cliente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Razão Social *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
              maxLength={18}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Região</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              />
            </div>
          </div>
          {isAdmin && (
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
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#1E40AF] hover:bg-[#1E40AF]/90">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
