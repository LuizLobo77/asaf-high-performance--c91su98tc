import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatISO } from 'date-fns'
import { CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { VisitResult } from '@/lib/types'

type FormItem = {
  id: string
  industryId: string
  result: VisitResult
  value: string
}

export default function RegistrarVisita() {
  const navigate = useNavigate()
  const { currentUser, clients, industries, addVisit } = useAppStore()

  const [isSuccess, setIsSuccess] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [clientId, setClientId] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<FormItem[]>([
    { id: `i-${Date.now()}`, industryId: '', result: 'Venda', value: '' },
  ])

  if (!currentUser) return null

  const myClients =
    currentUser.role === 'vendedor' ? clients.filter((c) => c.sellerId === currentUser.id) : clients

  // Filter out soft-deleted industries for new registrations
  const activeIndustries = industries.filter((i) => i.status !== 'inactive')

  const addItemRow = () => {
    setItems([...items, { id: `i-${Date.now()}`, industryId: '', result: 'Venda', value: '' }])
  }

  const removeItemRow = (id: string) => {
    if (items.length === 1) return
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof FormItem, val: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: val } : item)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) return

    for (const item of items) {
      if (!item.industryId) {
        toast({
          title: 'Atenção',
          description: 'Selecione uma indústria para todas as interações.',
          variant: 'destructive',
        })
        return
      }
      if (item.result === 'Venda' && (!item.value || Number(item.value) <= 0)) {
        toast({
          title: 'Atenção',
          description: 'Informe um valor válido para as vendas.',
          variant: 'destructive',
        })
        return
      }
    }

    addVisit({
      id: `v-new-${Date.now()}`,
      date: formatISO(new Date(date)),
      sellerId: currentUser.id,
      clientId,
      notes,
      items: items.map((item) => ({
        id: `vi-new-${Math.random()}`,
        industryId: item.industryId,
        result: item.result,
        value: item.result === 'Venda' ? Number(item.value) : undefined,
      })),
    })

    setIsSuccess(true)
  }

  const resetForm = () => {
    setClientId('')
    setNotes('')
    setItems([{ id: `i-${Date.now()}`, industryId: '', result: 'Venda', value: '' }])
    setIsSuccess(false)
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
        <CheckCircle2 className="w-24 h-24 text-success mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold mb-2 text-[#1E40AF]">Visita Registrada!</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          As informações de todas as indústrias foram salvas e já refletem na sua performance.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            Ir para Dashboard
          </Button>
          <Button onClick={resetForm}>Registrar Nova</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E40AF]">Registrar Visita</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os detalhes e adicione os resultados por indústria.
        </p>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Data da Visita</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Cliente Visitado</Label>
                <Select value={clientId} onValueChange={setClientId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {myClients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold text-[#1E40AF]">Interações e Vendas</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItemRow}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Venda
                </Button>
              </div>

              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/20 p-4 rounded-lg border border-border/50 relative animate-in slide-in-from-top-2"
                >
                  <div className="md:col-span-4 space-y-2">
                    <Label>Indústria</Label>
                    <Select
                      value={item.industryId}
                      onValueChange={(val) => updateItem(item.id, 'industryId', val)}
                    >
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
                  <div className="md:col-span-4 space-y-2">
                    <Label>Resultado</Label>
                    <Select
                      value={item.result}
                      onValueChange={(val) => updateItem(item.id, 'result', val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Venda">Venda Realizada</SelectItem>
                        <SelectItem value="Agendamento">Retorno Agendado</SelectItem>
                        <SelectItem value="Sem Venda">Sem Venda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    {item.result === 'Venda' && (
                      <>
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={item.value}
                          onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                        />
                      </>
                    )}
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItemRow(item.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações Gerais</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes adicionais da visita..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" className="w-full bg-[#1E40AF] hover:bg-[#1E40AF]/90">
              Salvar Registro Completo
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
