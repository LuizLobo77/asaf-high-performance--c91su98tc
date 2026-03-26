import { useState } from 'react'
import { Settings2, Trash2, Calculator, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAppStore from '@/stores/useAppStore'
import { toast } from '@/hooks/use-toast'
import type { User } from '@/lib/types'
import { calculateCommissions } from '@/lib/commissionLogic'

export default function Vendedores() {
  const {
    currentUser,
    users,
    updateUser,
    industries,
    commissionRules,
    setCommissionRule,
    deleteCommissionRule,
  } = useAppStore()

  const [isSplitOpen, setIsSplitOpen] = useState(false)

  // Split Config State
  const [splitUser, setSplitUser] = useState<User | null>(null)
  const [splitIndustryId, setSplitIndustryId] = useState('')
  const [splitPercent, setSplitPercent] = useState('')

  // Simulation State
  const [simOrderValue, setSimOrderValue] = useState('100000')
  const [simIndustryId, setSimIndustryId] = useState('')

  if (!currentUser) return null

  if (currentUser.role !== 'gestor') {
    return <div className="text-center py-20 text-destructive font-bold text-xl">Acesso Negado</div>
  }

  const sellers = users.filter((u) => u.role === 'vendedor')
  const activeIndustries = industries.filter((i) => i.status !== 'inactive')

  const openSplitConfig = (u: User) => {
    setSplitUser(u)
    setSplitIndustryId('')
    setSplitPercent('')
    setSimIndustryId('')
    setIsSplitOpen(true)
  }

  const handleDeactivate = (u: User) => {
    updateUser(u.id, { status: 'inactive' })
    toast({
      title: `Vendedor ${u.name} desativado.`,
      description: 'Acesso bloqueado e oculto em novos registros.',
    })
  }

  const handleActivate = (u: User) => {
    updateUser(u.id, { status: 'active' })
    toast({ title: `Vendedor ${u.name} reativado.` })
  }

  const handleAddSplit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!splitUser || !splitIndustryId || !splitPercent) return

    const existing = commissionRules.find(
      (r) => r.sellerId === splitUser.id && r.industryId === splitIndustryId,
    )
    setCommissionRule({
      id: existing ? existing.id : `cr-${Date.now()}`,
      sellerId: splitUser.id,
      industryId: splitIndustryId,
      splitPercent: Number(splitPercent),
    })
    setSplitIndustryId('')
    setSplitPercent('')
    toast({ title: 'Regra de comissão salva.' })
  }

  const userSplits = splitUser ? commissionRules.filter((r) => r.sellerId === splitUser.id) : []
  const simRule = userSplits.find((r) => r.industryId === simIndustryId)
  const simIndustry = industries.find((i) => i.id === simIndustryId)

  let simResult = null
  if (simRule && simIndustry && Number(simOrderValue) > 0) {
    simResult = calculateCommissions(
      Number(simOrderValue),
      simIndustry.commissionPercent,
      simRule.splitPercent,
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E40AF]">Equipe de Vendas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua equipe, configure splits de comissão e desative vendedores.
          </p>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Força de Vendas
          </CardTitle>
          <CardDescription>
            Para criar ou editar dados cadastrais, acesse a aba Gestão de Acessos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((s) => (
                <TableRow
                  key={s.id}
                  className={s.status === 'inactive' ? 'opacity-60 bg-muted/30' : ''}
                >
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>{s.phone || 'Não informado'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={s.status === 'active' ? 'default' : 'secondary'}
                      className={s.status === 'active' ? 'bg-success hover:bg-success/90' : ''}
                    >
                      {s.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openSplitConfig(s)}
                        title="Configurar Regras de Comissão"
                      >
                        <Settings2 className="w-4 h-4 text-[#1E40AF]" />
                      </Button>

                      {s.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeactivate(s)}
                          className="text-destructive hover:bg-destructive/10"
                          title="Desativar Vendedor (Exclusão Lógica)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(s)}
                          title="Reativar Vendedor"
                        >
                          Reativar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {sellers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum vendedor cadastrado na plataforma. Vá em Gestão de Acessos para
                    adicionar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Configuração de Split Dialog */}
      <Dialog open={isSplitOpen} onOpenChange={setIsSplitOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Regras de Comissão: {splitUser?.name}</DialogTitle>
            <DialogDescription>
              Defina o percentual de split exclusivo deste vendedor para cada indústria ativa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <form
              onSubmit={handleAddSplit}
              className="flex items-end gap-4 bg-muted/20 p-4 rounded-lg border border-border/50"
            >
              <div className="flex-1 space-y-2">
                <Label>Indústria</Label>
                <Select value={splitIndustryId} onValueChange={setSplitIndustryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeIndustries.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-32 space-y-2">
                <Label>Split (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={splitPercent}
                  onChange={(e) => setSplitPercent(e.target.value)}
                  placeholder="Ex: 25"
                  required
                />
              </div>
              <Button type="submit" variant="secondary">
                Adicionar Regra
              </Button>
            </form>

            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indústria</TableHead>
                    <TableHead className="text-right">Percentual de Split</TableHead>
                    <TableHead className="w-[100px] text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userSplits.map((rule) => {
                    const ind = industries.find((i) => i.id === rule.industryId)
                    return (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">
                          {ind?.name || 'Indústria não encontrada'}
                          {ind?.status === 'inactive' && (
                            <span className="text-xs text-muted-foreground ml-2">(Inativa)</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{rule.splitPercent}%</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => deleteCommissionRule(rule.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {userSplits.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        Nenhuma regra de split configurada para este vendedor.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Simulation Engine Preview */}
            <div className="mt-8 pt-6 border-t border-border/50 animate-fade-in">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-[#1E40AF] mb-4">
                <Calculator className="w-4 h-4" /> Simulador de Repasse (Motor de Cálculo)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor do Pedido (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={simOrderValue}
                    onChange={(e) => setSimOrderValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Indústria (Com regra definida)</Label>
                  <Select value={simIndustryId} onValueChange={setSimIndustryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a indústria..." />
                    </SelectTrigger>
                    <SelectContent>
                      {userSplits.map((r) => {
                        const ind = industries.find((i) => i.id === r.industryId)
                        if (!ind) return null
                        return (
                          <SelectItem key={r.industryId} value={r.industryId}>
                            {ind.name} ({r.splitPercent}% split)
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {simResult && simIndustry && simRule && (
                <div className="mt-6 p-4 bg-muted/30 border border-border/50 rounded-lg space-y-3 animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      Comissão Padrão da Indústria ({simIndustry.name})
                    </span>
                    <span className="font-medium">
                      {(simIndustry.commissionPercent * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Comissão Total Asaf</span>
                    <span className="font-semibold text-primary">
                      R${' '}
                      {simResult.companyTotalCommission.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-border/50 pt-2">
                    <span className="text-muted-foreground">Split do Vendedor</span>
                    <span className="font-medium">{simRule.splitPercent}%</span>
                  </div>
                  <div className="flex justify-between items-center text-base pt-1">
                    <span className="font-bold text-[#1E40AF]">Comissão Final do Vendedor</span>
                    <span className="font-bold text-success">
                      R${' '}
                      {simResult.sellerCommission.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
