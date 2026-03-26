import { useState } from 'react'
import { UploadCloud, DownloadCloud, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { Client } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'

type ImportError = { line: number; message: string }
type ImportReport = { total: number; success: number; failed: number; errors: ImportError[] }

function parseCSVLine(text: string) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') inQuotes = !inQuotes
    else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else current += char
  }
  result.push(current)
  return result.map((s) => s.trim().replace(/^"|"$/g, ''))
}

export default function ClientImport() {
  const { importClients, clients, currentUser } = useAppStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      return toast({
        title: 'Erro',
        description: 'Envie apenas arquivos CSV.',
        variant: 'destructive',
      })
    }
    setIsImporting(true)
    setProgress(0)
    setReport(null)

    try {
      const text = await file.text()
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
      if (lines.length < 2) throw new Error('Arquivo vazio.')

      const errors: ImportError[] = []
      const validClients: Client[] = []
      const existingCnpjs = new Set(clients.map((c) => c.cnpj?.replace(/\D/g, '')).filter(Boolean))

      lines.slice(1).forEach((line, i) => {
        const lineNum = i + 2
        const cols = parseCSVLine(line)
        const name = cols[0]
        const city = cols[1] || ''
        const cnpjRaw = cols[2] || ''

        if (!name) {
          return errors.push({
            line: lineNum,
            message: 'Corporate Name (Razao_Social) cannot be blank',
          })
        }

        let cnpj = ''
        if (cnpjRaw) {
          cnpj = cnpjRaw.replace(/\D/g, '')
          if (cnpj.length !== 14 && cnpj.length > 0) {
            return errors.push({ line: lineNum, message: 'CNPJ invalid' })
          }
          if (cnpj.length === 14) {
            if (existingCnpjs.has(cnpj)) {
              return errors.push({ line: lineNum, message: 'CNPJ already exists in the system' })
            }
            existingCnpjs.add(cnpj)
          }
        }

        validClients.push({
          id: `cli-imp-${Date.now()}-${i}`,
          name,
          city,
          cnpj,
          region: 'Geral',
          status: 'active',
          sellerId: currentUser?.id || 'sys',
        })
      })

      const batches = []
      for (let i = 0; i < validClients.length; i += 100) {
        batches.push(validClients.slice(i, i + 100))
      }

      let importedCount = 0
      for (let i = 0; i < batches.length; i++) {
        await new Promise((res) => setTimeout(res, 250))
        importClients(batches[i])
        importedCount += batches[i].length
        setProgress(Math.round(((i + 1) / batches.length) * 100))
      }

      if (batches.length === 0) setProgress(100)

      setReport({ total: lines.length - 1, success: importedCount, failed: errors.length, errors })
      setIsReportOpen(true)
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Falha ao processar o arquivo.',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob(['Razão Social,Cidade,CNPJ\n'], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'template_clientes.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-[#1E40AF]">Upload de Clientes</CardTitle>
          <CardDescription>
            Suporta grandes volumes de dados (lotes de 100 registros).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer relative ${
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
            onClick={() => !isImporting && document.getElementById('csv-upload-client')?.click()}
          >
            {isImporting ? (
              <div className="w-full space-y-4">
                <div className="text-center font-medium text-[#1E40AF]">
                  Processando Lotes... {progress}%
                </div>
                <Progress value={progress} className="w-full h-3" />
              </div>
            ) : (
              <>
                <UploadCloud
                  className={`w-16 h-16 mb-4 ${
                    isDragging ? 'text-[#1E40AF] animate-bounce' : 'text-[#6B7280]'
                  }`}
                />
                <h3 className="text-lg font-semibold text-[#1E40AF] mb-1">
                  Arraste seu CSV de Clientes
                </h3>
                <p className="text-sm text-[#6B7280] mb-4 text-center">
                  ou clique para procurar no computador
                </p>
                <Button variant="outline" className="pointer-events-none">
                  Selecionar Arquivo
                </Button>
              </>
            )}
            <input
              type="file"
              id="csv-upload-client"
              className="hidden"
              accept=".csv"
              disabled={isImporting}
              onChange={(e) => {
                if (e.target.files?.[0]) processFile(e.target.files[0])
                e.target.value = ''
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 h-fit">
        <CardHeader>
          <CardTitle className="text-[#1E40AF]">Download de Template</CardTitle>
          <CardDescription>Baixe a planilha padrão para importação.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl bg-muted/10 text-center space-y-4 hover:bg-muted/30 transition-colors">
            <DownloadCloud className="w-16 h-16 text-[#6B7280]" />
            <div>
              <h3 className="text-lg font-semibold text-[#1E40AF]">Template de Clientes</h3>
              <p className="text-sm text-[#6B7280] mt-1 mb-4">
                Colunas: Razão Social, Cidade e CNPJ
              </p>
            </div>
            <Button
              onClick={downloadTemplate}
              className="w-full max-w-xs bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white shadow-md transition-all hover:shadow-lg"
            >
              Baixar Planilha Padrão
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Relatório de Importação</DialogTitle>
            <DialogDescription>Resumo do processamento do arquivo de clientes.</DialogDescription>
          </DialogHeader>
          {report && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">{report.total}</div>
                  <div className="text-sm text-muted-foreground">Total Lido</div>
                </div>
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold">{report.success}</div>
                  <div className="text-sm">Sucesso</div>
                </div>
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold">{report.failed}</div>
                  <div className="text-sm">Falhas</div>
                </div>
              </div>
              {report.errors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" /> Detalhes das Falhas
                  </h4>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <ul className="space-y-2">
                      {report.errors.map((err, idx) => (
                        <li key={idx} className="text-sm text-destructive flex items-start gap-2">
                          <span className="font-medium whitespace-nowrap">Linha {err.line}:</span>
                          <span>{err.message}</span>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsReportOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
