import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

export default function Configuracoes() {
  const { currentUser, users, setCurrentUser } = useAppStore()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">Ajustes do sistema e perfil.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Modo de Demonstração</CardTitle>
          <CardDescription>
            Alterne entre os usuários para testar as diferentes visões do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Usuário Ativo</Label>
            <Select value={currentUser.id} onValueChange={setCurrentUser}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} - {u.role === 'gestor' ? 'Gestor' : 'Vendedor'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-muted rounded-lg mt-6">
            <h4 className="font-medium mb-2 text-sm">Informações do Perfil Atual</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>
                <strong>Nome:</strong> {currentUser.name}
              </li>
              <li>
                <strong>Email:</strong> {currentUser.email}
              </li>
              <li>
                <strong>Papel:</strong> <span className="capitalize">{currentUser.role}</span>
              </li>
              {currentUser.target > 0 && (
                <li>
                  <strong>Meta Mensal:</strong> R$ {currentUser.target.toLocaleString('pt-BR')}
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
