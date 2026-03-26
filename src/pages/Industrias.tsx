import { useState } from 'react'
import { Building2, Plus, Trash2, Pencil, CheckCircle2 } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
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
import type { Industry } from '@/lib/types'
import { EditIndustryDialog } from '@/components/industries/EditIndustryDialog'

export default function Industrias() {
  const { currentUser, industries, addIndustry, deleteIndustry, updateIndustry } = useAppStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [commission, setCommission] = useState('')
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)

  if (!currentUser) return null

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
      status: 'active',
    })

    toast({ title: 'Indústria adicionada com sucesso.' })
    setOpen(false)
    setName('')
    setCommission('')
  }

  const handleDeactivate = (id: string) => {
    deleteIndustry(id)
    toast({ title: 'Indústria desativada.', description: 'Ela não aparecerá em novos registros.' })
  }

  const handleActivate = (id: string) => {
    updateIndustry(id, { status: 'active' })
    toast({ title: 'Indústria reativada.' })
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E40AF]">
            Indústrias
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gerencie os fornecedores e taxas de comissão.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-[#1E40AF] hover:bg-[#1E40AF]/90">
              <Plus className="w-4 h-4 mr-2" /> Nova Indústria
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-[425px] rounded-lg">
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
                <Label htmlFor="commission">Percentual de Comissão Padrão (%)</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="Ex: 5"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#1E40AF] hover:bg-[#1E40AF]/90">
                Salvar Indústria
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Lista de Representadas
          </CardTitle>
          <CardDescription>Total de {industries.length} indústrias cadastradas.</CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-6 sm:pt-0">
          {/* Desktop Table View */}
          <div className="hidden md:block w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Comissão Padrão (%)</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {industries.map((ind) => (
                  <TableRow
                    key={ind.id}
                    className={ind.status === 'inactive' ? 'opacity-60 bg-muted/30' : ''}
                  >
                    <TableCell className="font-medium min-w-[150px]">{ind.name}</TableCell>
                    <TableCell className="text-right min-w-[150px]">
                      {(ind.commissionPercent * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={ind.status === 'inactive' ? 'secondary' : 'default'}
                        className={
                          ind.status !== 'inactive' ? 'bg-success hover:bg-success/90' : ''
                        }
                      >
                        {ind.status === 'inactive' ? 'Inativa' : 'Ativa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingIndustry(ind)}
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                      {ind.status !== 'inactive' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeactivate(ind.id)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Desativar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(ind.id)}
                          title="Reativar"
                        >
                          Reativar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {industries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhuma indústria cadastrada no momento.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden mt-2">
            {industries.map((ind) => (
              <Card
                key={ind.id}
                className={`overflow-hidden border-border/50 shadow-sm ${
                  ind.status === 'inactive' ? 'opacity-70 bg-muted/30' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-semibold text-base leading-tight text-[#1E40AF]">
                      {ind.name}
                    </span>
                    <Badge
                      variant={ind.status === 'inactive' ? 'secondary' : 'default'}
                      className={
                        ind.status !== 'inactive'
                          ? 'bg-success hover:bg-success/90 shrink-0'
                          : 'shrink-0'
                      }
                    >
                      {ind.status === 'inactive' ? 'Inativa' : 'Ativa'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm bg-muted/30 p-3 rounded-md mb-4 border border-border/50">
                    <span className="font-medium text-muted-foreground">Comissão Padrão</span>
                    <span className="font-bold text-foreground text-base">
                      {(ind.commissionPercent * 100).toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingIndustry(ind)}
                      className="flex-1 sm:flex-none"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    {ind.status !== 'inactive' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeactivate(ind.id)}
                        className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10 border-destructive/20"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Desativar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivate(ind.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Reativar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {industries.length === 0 && (
              <div className="text-center text-muted-foreground py-8 border border-border/50 rounded-lg bg-muted/10">
                Nenhuma indústria cadastrada no momento.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditIndustryDialog industry={editingIndustry} onClose={() => setEditingIndustry(null)} />
    </div>
  )
}
