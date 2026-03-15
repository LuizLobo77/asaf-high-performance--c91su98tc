import { useState } from 'react'
import { UploadCloud, FileType } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { VisitResult } from '@/lib/types'

export default function ImportarDados() {
  const { currentUser, importVisits, users, clients, industries } = useAppStore()
  const [isDragging, setIsDragging] = useState(false)

  if (currentUser.role !== 'gestor') {
    return <div className="text-center py-20 text-destructive font-bold text-xl">Acesso Negado</div>
  }

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Erro',
        description: 'Por favor, envie apenas arquivos CSV.',
        variant: 'destructive',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter((l) => l.trim())
        if (lines.length < 2) throw new Error('Arquivo vazio ou sem dados.')

        const newVisits = lines.slice(1).map((line, i) => {
          // Expected CSV Format: Data,ID_Vendedor,ID_Cliente,Resultado,Valor,ID_Industria,ID_Pedido
          const [date, sellerId, clientId, result, value, industryId, extId] = line
            .split(',')
            .map((s) => s.trim())

          return {
            id: `imp-${Date.now()}-${i}`,
            date: date ? new Date(date).toISOString() : new Date().toISOString(),
            sellerId: sellerId || users[1].id,
            clientId: clientId || clients[0].id,
            result: (result as VisitResult) || 'Venda',
            value: Number(value) || 0,
            industryId: industryId || industries[0].id,
            externalId: extId,
          }
        })

        importVisits(newVisits)
        toast({
          title: 'Importação Concluída',
          description: `${newVisits.length} registros processados com sucesso.`,
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

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importar Dados</h1>
        <p className="text-muted-foreground mt-1">
          Sincronize as informações do SuasVendas via CSV.
        </p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Upload de Arquivo</CardTitle>
          <CardDescription>
            O sistema identificará automaticamente a coluna ID_Pedido para evitar duplicidade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-16 flex flex-col items-center justify-center transition-colors cursor-pointer
              ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById('csv-upload')?.click()}
          >
            <UploadCloud
              className={`w-16 h-16 mb-4 ${isDragging ? 'text-primary animate-bounce' : 'text-muted-foreground'}`}
            />
            <h3 className="text-lg font-semibold mb-1">Arraste seu arquivo CSV aqui</h3>
            <p className="text-sm text-muted-foreground mb-4">
              ou clique para procurar no seu computador
            </p>
            <Button variant="outline" className="pointer-events-none">
              Selecionar Arquivo
            </Button>
            <input
              type="file"
              id="csv-upload"
              className="hidden"
              accept=".csv"
              onChange={(e) => {
                if (e.target.files?.[0]) processFile(e.target.files[0])
                e.target.value = '' // reset
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
