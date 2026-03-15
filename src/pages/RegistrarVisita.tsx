import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatISO } from 'date-fns'
import { CheckCircle2 } from 'lucide-react'
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
import useAppStore from '@/stores/useAppStore'
import { VisitResult } from '@/lib/types'

export default function RegistrarVisita() {
  const navigate = useNavigate()
  const { currentUser, clients, industries, addVisit } = useAppStore()

  const [isSuccess, setIsSuccess] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [clientId, setClientId] = useState('')
  const [result, setResult] = useState<VisitResult>('Venda')
  const [value, setValue] = useState('')
  const [industryId, setIndustryId] = useState('')
  const [notes, setNotes] = useState('')

  const myClients =
    currentUser.role === 'vendedor' ? clients.filter((c) => c.sellerId === currentUser.id) : clients

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) return

    addVisit({
      id: `v-new-${Date.now()}`,
      date: formatISO(new Date(date)),
      sellerId: currentUser.id,
      clientId,
      result,
      value: result === 'Venda' ? Number(value) : undefined,
      industryId: result === 'Venda' ? industryId : undefined,
      notes,
    })

    setIsSuccess(true)
  }

  const resetForm = () => {
    setClientId('')
    setResult('Venda')
    setValue('')
    setIndustryId('')
    setNotes('')
    setIsSuccess(false)
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
        <CheckCircle2 className="w-24 h-24 text-success mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold mb-2">Visita Registrada!</h2>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          Os dados foram salvos com sucesso e já estão refletindo nos indicadores de performance.
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registrar Visita</h1>
        <p className="text-muted-foreground mt-1">
          Preencha os detalhes da sua interação com o cliente.
        </p>
      </div>

      <Card className="border-border/50">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label>Resultado</Label>
              <Select
                value={result}
                onValueChange={(val) => setResult(val as VisitResult)}
                required
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

            {result === 'Venda' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="value">Valor da Venda (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 1500.50"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Indústria / Fornecedor</Label>
                  <Select value={industryId} onValueChange={setIndustryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a indústria" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((i) => (
                        <SelectItem key={i.id} value={i.id}>
                          {i.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                placeholder="Detalhes adicionais da visita..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button type="submit" className="w-full">
              Salvar Registro
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
