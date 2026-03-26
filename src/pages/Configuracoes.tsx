import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, RefreshCw, Upload, Download, Trash2, Image as ImageIcon } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export default function Configuracoes() {
  const {
    currentUser,
    logoUrl,
    setLogoUrl,
    suasVendasApiKey,
    setSuasVendasApiKey,
    syncSuasVendas,
    lastSync,
  } = useAppStore()

  const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl)
  const [localApiKey, setLocalApiKey] = useState(suasVendasApiKey)
  const [isSyncing, setIsSyncing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!currentUser) return null

  const handleSaveBrand = () => {
    setLogoUrl(localLogoUrl)
    toast({ title: 'Configurações Salvas', description: 'A identidade visual foi atualizada.' })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Formato inválido',
        description: 'Por favor, envie um arquivo PNG, JPG ou SVG.',
        variant: 'destructive',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setLocalLogoUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLocalLogoUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDownload = async () => {
    if (!localLogoUrl) return

    try {
      if (localLogoUrl.startsWith('data:') || localLogoUrl.startsWith('blob:')) {
        const a = document.createElement('a')
        a.href = localLogoUrl
        a.download = 'logo-empresa'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        const response = await fetch(localLogoUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'logo-empresa'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast({
        title: 'Aviso ao baixar',
        description:
          'Não foi possível fazer o download direto. A imagem será aberta em uma nova guia.',
      })
      window.open(localLogoUrl, '_blank')
    }
  }

  const handleSaveIntegration = () => {
    setSuasVendasApiKey(localApiKey)
    toast({ title: 'Integração Salva', description: 'API Key do Suas Vendas configurada.' })
  }

  const handleSync = async () => {
    if (!suasVendasApiKey) {
      toast({
        title: 'Atenção',
        description: 'Salve a API Key antes de sincronizar.',
        variant: 'destructive',
      })
      return
    }
    try {
      setIsSyncing(true)
      await syncSuasVendas()
      toast({
        title: 'Sincronização Concluída',
        description: 'Os dados de pedidos e funil foram importados.',
      })
    } catch (e: any) {
      toast({ title: 'Erro na Sincronização', description: e.message, variant: 'destructive' })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Ajustes do sistema, integrações e perfil.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
          <CardDescription>Informações da sua conta vinculada.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Nome:</strong> {currentUser.name}
              </li>
              <li>
                <strong className="text-foreground">Email:</strong> {currentUser.email}
              </li>
              <li>
                <strong className="text-foreground">Papel:</strong>{' '}
                <span className="capitalize">
                  {currentUser.role === 'gestor' ? 'Administrador' : 'Vendedor'}
                </span>
              </li>
              {currentUser.target > 0 && (
                <li>
                  <strong className="text-foreground">Meta Mensal:</strong> R${' '}
                  {currentUser.target.toLocaleString('pt-BR')}
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>

      {currentUser.role === 'gestor' && (
        <>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Identidade Visual</CardTitle>
              <CardDescription>
                Personalize a logo da plataforma para fortalecer a sua marca.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Upload da Logo</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex-1 space-y-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.svg"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Selecionar Arquivo
                      </Button>
                      <Button onClick={handleSaveBrand}>
                        <Save className="w-4 h-4 mr-2" /> Salvar Alterações
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formatos suportados: PNG, JPG, SVG. O arquivo será salvo para todos os
                      usuários.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Pré-visualização</Label>
                {localLogoUrl ? (
                  <div className="p-6 border border-dashed rounded-xl bg-muted/30 flex flex-col items-center justify-center gap-6 transition-all duration-300">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-border/50">
                      <img
                        src={localLogoUrl}
                        alt="Preview Logo"
                        className="max-h-24 object-contain"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="secondary" size="sm" onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" /> Baixar Logo
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleRemoveLogo}>
                        <Trash2 className="w-4 h-4 mr-2" /> Remover
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed rounded-xl bg-muted/10 flex flex-col items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma logo configurada no momento.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Integração: Suas Vendas</CardTitle>
              <CardDescription>
                Sincronize automaticamente os pedidos e o funil de vendas do sistema externo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key / Token de Acesso</Label>
                <div className="flex gap-2">
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder="Insira o Token do Suas Vendas"
                    value={localApiKey}
                    onChange={(e) => setLocalApiKey(e.target.value)}
                  />
                  <Button onClick={handleSaveIntegration} variant="secondary">
                    <Save className="w-4 h-4 mr-2" /> Salvar
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Sincronização Manual</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Última sincronização:{' '}
                    {lastSync ? format(new Date(lastSync), 'dd/MM/yyyy HH:mm') : 'Nunca'}
                  </p>
                </div>
                <Button variant="outline" onClick={handleSync} disabled={isSyncing}>
                  <RefreshCw className={cn('w-4 h-4 mr-2', isSyncing && 'animate-spin')} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
