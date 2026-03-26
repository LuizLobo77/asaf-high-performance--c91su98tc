import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import useAppStore from '@/stores/useAppStore'

export function LowTractionIndustries({ data, period }: { data: any[]; period: string }) {
  const { addIndustryNote, industryNotes } = useAppStore()
  const [selectedInd, setSelectedInd] = useState<any>(null)
  const [noteText, setNoteText] = useState('')

  const handleBarClick = (entry: any) => {
    const dataItem = entry.payload || entry
    if (!dataItem) return
    setSelectedInd(dataItem)
    const existingNote = industryNotes
      .filter((n) => n.industryId === dataItem.id && n.period === period)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    setNoteText(existingNote?.note || '')
  }

  const handleSaveNote = () => {
    if (selectedInd) {
      addIndustryNote({
        industryId: selectedInd.id,
        period,
        note: noteText,
      })
      setSelectedInd(null)
    }
  }

  return (
    <Card className="col-span-1 border-border/50 bg-card/80 backdrop-blur-sm flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-warning">Menor Tração</CardTitle>
        <CardDescription>
          Top 5 indústrias com menor volume. Clique para justificar.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        <div className="h-[250px] cursor-pointer">
          <ChartContainer
            config={{ value: { label: 'Vendas (R$)', color: 'hsl(var(--warning))' } }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `R$${val / 1000}k`}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  width={130}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  content={
                    <ChartTooltipContent
                      valueFormatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`}
                    />
                  }
                  cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} onClick={handleBarClick}>
                  {data.map((_, i) => (
                    <Cell
                      key={i}
                      fill="hsl(var(--warning))"
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>

      <Dialog open={!!selectedInd} onOpenChange={(open) => !open && setSelectedInd(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justificativa de Performance</DialogTitle>
            <DialogDescription>
              Adicione notas sobre a baixa tração da indústria <strong>{selectedInd?.name}</strong>{' '}
              neste período.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Ex: Preço fora de mercado, falta de estoque..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInd(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNote}>Salvar Justificativa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
