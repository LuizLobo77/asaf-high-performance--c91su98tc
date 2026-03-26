import { useState } from 'react'
import { Building2, Plus, Trash2 } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import useAppStore from '@/stores/useAppStore'
import { toast } from '@/hooks/use-toast'

export default function Industrias() {
  const { currentUser, industries, addIndustry, deleteIndustry, visits } = useAppStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [commission, setCommission] = useState('')

  if (currentUser.role !== 'gestor') {
    return <div className="text-center py-20 text-destructive font-bold text-xl">Acesso Negado</div>
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !commission) return

    addIndustry({
      id: `i-${Date.now()}`,
      name,
      commissionPercent: Number(commission) / 100,
    })

    toast({ title: 'Indústria adicionada com sucesso.' })
    setOpen(false)
    setName('')
    setCommission('')
  }

  const handleDelete = (id: string) => {
    const isUsed = visits.some((v) => v.items.some((i) => i.industryId === id))
    if (isUsed) {
      toast({
        title: 'Não é possível remover',
        description: 'Esta indústria possui registros de visitas atrelados a ela.',
        variant: 'destructive',
      })
      return
    }
    deleteIndustry(id)
    toast({ title: 'Indústria removida.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E40AF]">Indústrias</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os fornecedores e taxas de comissão.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1E40AF] hover:bg-[#1E40AF]/90">
              <Plus className="w-4 h-4 mr-2" /> Nova Indústria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Fornecedor</DialogTitle>
              <DialogDescription>
                Cadastre uma nova indústria para ser usada nos registros.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Indústria</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission">Comissão Padrão (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar Indústria
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Lista de Representadas
          </CardTitle>
          <CardDescription>Total de {industries.length} indústrias cadastradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Comissão (%)</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {industries.map((ind) => (
                <TableRow key={ind.id}>
                  <TableCell className="font-medium">{ind.name}</TableCell>
                  <TableCell className="text-right">
                    {(ind.commissionPercent * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(ind.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
