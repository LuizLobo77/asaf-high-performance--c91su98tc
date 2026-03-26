import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, RefreshCw } from 'lucide-react'
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

  if (!currentUser) return null

  const handleSaveBrand = () => {
    setLogoUrl(localLogoUrl)
    toast({ title: 'Configurações Salvas', description: 'A identidade visual foi atualizada.' })
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL da Logo</Label>
                <div className="flex gap-2">
                  <Input
                    id="logoUrl"
                    placeholder="https://exemplo.com/logo.png"
                    value={localLogoUrl}
                    onChange={(e) => setLocalLogoUrl(e.target.value)}
                  />
                  <Button onClick={handleSaveBrand}>
                    <Save className="w-4 h-4 mr-2" /> Salvar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Insira uma URL pública de imagem (PNG, JPG, SVG).
                </p>
              </div>
              {localLogoUrl && (
                <div className="mt-4 p-4 border rounded-lg bg-muted/20 flex items-center justify-center">
                  <img src={localLogoUrl} alt="Preview Logo" className="max-h-16 object-contain" />
                </div>
              )}
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
