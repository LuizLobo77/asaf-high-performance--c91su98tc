import { useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { VisitResult, Visit } from '@/lib/types'

function parseCSVLine(text: string, separator: string = ',') {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') inQuotes = !inQuotes
    else if (char === separator && !inQuotes) {
      result.push(current)
      current = ''
    } else current += char
  }
  result.push(current)
  return result.map((s) => s.trim().replace(/^"|"$/g, ''))
}

export default function VisitImport() {
  const { importVisits, users, clients, industries } = useAppStore()
  const [isDragging, setIsDragging] = useState(false)

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Erro',
        description: 'Por favor, envie apenas arquivos CSV.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'O arquivo excede o limite de 8MB.',
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

        const separator = lines[0].includes(';') ? ';' : ','
        const groupedVisits: Record<string, Visit> = {}

        lines.slice(1).forEach((line, i) => {
          const cols = parseCSVLine(line, separator)
          const date = cols[0]
          const sellerId = cols[1]
          const clientId = cols[2]
          const result = cols[3]
          const value = cols[4]
          const industryId = cols[5]
          const extId = cols[6]

          const visitKey = extId || `no-ext-${date}-${sellerId}-${clientId}`

          if (!groupedVisits[visitKey]) {
            groupedVisits[visitKey] = {
              id: `imp-${Date.now()}-${i}`,
              date: date ? new Date(date).toISOString() : new Date().toISOString(),
              sellerId: sellerId || users[1]?.id || users[0]?.id || 'sys',
              clientId: clientId || clients[0]?.id || 'cli-0',
              externalId: extId,
              items: [],
            }
          }

          groupedVisits[visitKey].items.push({
            id: `imp-item-${Date.now()}-${i}`,
            industryId: industryId || industries[0]?.id || 'ind-0',
            result: (result as VisitResult) || 'Venda',
            value: Number(value) || 0,
          })
        })

        const newVisits = Object.values(groupedVisits)
        importVisits(newVisits)

        toast({
          title: 'Importação Concluída',
          description: `${newVisits.length} visitas agrupadas e processadas.`,
        })
      } catch (err) {
        toast({
          title: 'Erro na importação',
          description: 'O formato do arquivo é inválido.',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-[#1E40AF]">Upload de Visitas</CardTitle>
        <CardDescription className="text-[#6B7280]">
          O sistema agrupará automaticamente itens com o mesmo ID_Pedido na mesma visita (Max 8MB).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            if (e.dataTransfer.files?.length) processFile(e.dataTransfer.files[0])
          }}
          onClick={() => document.getElementById('csv-upload-visit')?.click()}
        >
          <UploadCloud
            className={`w-16 h-16 mb-4 ${
              isDragging ? 'text-[#1E40AF] animate-bounce' : 'text-[#6B7280]'
            }`}
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
            id="csv-upload-visit"
            className="hidden"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files?.[0]) processFile(e.target.files[0])
              e.target.value = ''
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
