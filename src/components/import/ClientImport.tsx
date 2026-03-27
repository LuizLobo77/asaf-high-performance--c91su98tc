import { useState } from 'react'
import { UploadCloud, DownloadCloud, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { Client } from '@/lib/types'
import { fixMalformedUTF8 } from '@/lib/utils'
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

const formatCNPJ = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .substring(0, 18)
}

type ImportError = { line: number; message: string }
type ImportReport = { total: number; success: number; failed: number; errors: ImportError[] }

function parseCSV(text: string, separator: string = ','): string[][] {
  const result: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentCell += '"'
        i++ // Skip escaped quote
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentCell += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === separator) {
        currentRow.push(currentCell.trim())
        currentCell = ''
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentCell.trim())
        if (currentRow.some((c) => c !== '')) result.push(currentRow)
        currentRow = []
        currentCell = ''
        i++ // Skip \n
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentCell.trim())
        if (currentRow.some((c) => c !== '')) result.push(currentRow)
        currentRow = []
        currentCell = ''
      } else {
        currentCell += char
      }
    }
  }

  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    if (currentRow.some((c) => c !== '')) result.push(currentRow)
  }

  return result
}

export default function ClientImport() {
  const { importClients, clients, currentUser } = useAppStore()
  const [isDragging, setIsDragging] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const processFile = async (file: File) => {
    if (file.name.match(/\.(xlsx|xls)$/i)) {
      return toast({
        title: 'Formato Incorreto',
        description:
          'Arquivos Excel não são suportados. Salve como "CSV (UTF-8)" e tente novamente.',
        variant: 'destructive',
      })
    }

    if (!file.name.match(/\.csv$/i)) {
      return toast({
        title: 'Erro',
        description: 'Envie apenas arquivos .csv.',
        variant: 'destructive',
      })
    }

    if (file.size > 8 * 1024 * 1024) {
      return toast({
        title: 'Erro',
        description: 'O arquivo excede o limite de 8MB.',
        variant: 'destructive',
      })
    }

    setIsImporting(true)
    setProgress(0)
    setReport(null)

    try {
      // Use FileReader explicitly forcing UTF-8 decoding to ensure standard character handling
      const text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'))
        reader.readAsText(file, 'UTF-8')
      })

      // Auto-detect separator
      const sample = text.slice(0, 1000)
      const separator =
        (sample.match(/;/g)?.length || 0) > (sample.match(/,/g)?.length || 0) ? ';' : ','

      const rows = parseCSV(text, separator)

      if (rows.length < 2) throw new Error('Arquivo vazio ou sem registros válidos.')

      const errors: ImportError[] = []
      const validClients: Client[] = []
      const existingCnpjs = new Set(clients.map((c) => c.cnpj?.replace(/\D/g, '')).filter(Boolean))
      const fileCnpjs = new Set<string>()

      let totalLido = rows.length - 1 // Exclude header

      rows.slice(1).forEach((cols, i) => {
        const lineNum = i + 2
        // Clean encoding for malformed inputs directly to guarantee readable UI
        const name = fixMalformedUTF8(cols[0] || '')
        const cnpjRaw = cols[1] || ''
        const city = fixMalformedUTF8(cols[2] || '')

        if (!name && !cnpjRaw && !city) {
          totalLido-- // Adjust for empty trailing rows
          return
        }

        if (!name) {
          return errors.push({
            line: lineNum,
            message: 'Razão_Social não pode ficar em branco',
          })
        }

        let cnpjStr = cnpjRaw.replace(/\D/g, '')
        if (!cnpjStr) {
          return errors.push({ line: lineNum, message: 'CNPJ é obrigatório' })
        }

        if (cnpjStr.length > 0 && cnpjStr.length < 14) {
          cnpjStr = cnpjStr.padStart(14, '0')
        }

        if (cnpjStr.length !== 14) {
          return errors.push({
            line: lineNum,
            message: `Formato de CNPJ inválido (${cnpjStr})`,
          })
        }

        if (existingCnpjs.has(cnpjStr) || fileCnpjs.has(cnpjStr)) {
          return errors.push({
            line: lineNum,
            message: 'CNPJ já existe no banco ou está duplicado no arquivo',
          })
        }

        fileCnpjs.add(cnpjStr)
        const formattedCnpj = formatCNPJ(cnpjStr)

        validClients.push({
          id: `cli-${Date.now()}-${i}`,
          name,
          city,
          cnpj: formattedCnpj,
          region: city || 'Geral',
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
        try {
          await importClients(batches[i])
          importedCount += batches[i].length
          setProgress(Math.round(((i + 1) / batches.length) * 100))
        } catch (dbError: any) {
          errors.push({
            line: i * 100 + 2,
            message: `Erro na inserção do banco de dados (Lote ${i + 1}): ${
              dbError.message || 'Falha de conexão'
            }`,
          })
          toast({
            title: 'Erro de Persistência',
            description: 'O processo foi interrompido devido a uma falha no banco de dados.',
            variant: 'destructive',
          })
          break
        }
      }

      if (batches.length === 0) setProgress(100)

      setReport({ total: totalLido, success: importedCount, failed: errors.length, errors })
      setIsReportOpen(true)
    } catch (err) {
      toast({
        title: 'Erro na leitura do arquivo',
        description: 'Certifique-se de que é um CSV válido com a formatação correta.',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    const bom = new Uint8Array([0xef, 0xbb, 0xbf])
    const blob = new Blob([bom, 'Razao_Social,CNPJ,Cidade\n'], { type: 'text/csv;charset=utf-8;' })
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
            Importação em lote suportando arquivos grandes (limite de 8MB).
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
                  Inserindo no Banco de Dados... {progress}%
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
                  Arraste sua planilha aqui
                </h3>
                <p className="text-sm text-[#6B7280] mb-4 text-center">
                  ou clique para procurar no computador (.csv)
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
          <CardDescription>Baixe a planilha modelo para evitar erros.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl bg-muted/10 text-center space-y-4 hover:bg-muted/30 transition-colors">
            <DownloadCloud className="w-16 h-16 text-[#6B7280]" />
            <div>
              <h3 className="text-lg font-semibold text-[#1E40AF]">Planilha Modelo</h3>
              <p className="text-sm text-[#6B7280] mt-1 mb-4">
                Cabeçalhos estritos: Razao_Social, CNPJ, Cidade
              </p>
            </div>
            <Button
              onClick={downloadTemplate}
              className="w-full max-w-xs bg-[#1E40AF] hover:bg-[#1E40AF]/90 text-white shadow-md transition-all hover:shadow-lg"
            >
              Baixar Planilha Modelo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Relatório de Importação</DialogTitle>
            <DialogDescription>
              Resumo da auditoria de processamento do arquivo de clientes.
            </DialogDescription>
          </DialogHeader>
          {report && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="text-2xl font-bold">{report.total}</div>
                  <div className="text-sm text-muted-foreground">Total lido</div>
                </div>
                <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold">{report.success}</div>
                  <div className="text-sm">Importados com sucesso</div>
                </div>
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                  <div className="text-2xl font-bold">{report.failed}</div>
                  <div className="text-sm">Falhas</div>
                </div>
              </div>
              {report.errors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" /> Log de Erros
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
