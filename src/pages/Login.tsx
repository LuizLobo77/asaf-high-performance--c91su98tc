import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import useAppStore from '@/stores/useAppStore'
import { User } from '@/lib/types'

export default function Login() {
  const [email, setEmail] = useState('carlos@asaf.com')
  const [password, setPassword] = useState('123456')
  const [requireChange, setRequireChange] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [tempUser, setTempUser] = useState<User | null>(null)

  const { login, updateUser, forceLogin } = useAppStore()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = login(email, password)
      if (res.success) {
        toast({ title: 'Login realizado com sucesso!' })
        navigate('/')
      } else if (res.requireChange && res.user) {
        setRequireChange(true)
        setTempUser(res.user)
        toast({
          title: 'Atualização Necessária',
          description: 'Por favor, defina uma nova senha de acesso.',
        })
      } else {
        toast({ title: 'Credenciais inválidas', variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempUser || !newPassword || newPassword.length < 6) {
      toast({
        title: 'Senha inválida',
        description: 'A nova senha deve ter pelo menos 6 caracteres.',
        variant: 'destructive',
      })
      return
    }

    updateUser(tempUser.id, { password: newPassword, mustChangePassword: false })
    forceLogin({ ...tempUser, password: newPassword, mustChangePassword: false })
    toast({ title: 'Senha atualizada', description: 'Bem-vindo ao sistema!' })
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lg animate-in zoom-in-95 duration-300">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-[#1E40AF] rounded-lg flex items-center justify-center text-primary-foreground shadow-md mb-4">
            <BarChart2 className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-[#1E40AF]">
            ASAF Performance
          </CardTitle>
          <CardDescription>
            {requireChange
              ? 'Defina sua nova senha para continuar'
              : 'Faça login para acessar o painel de vendas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requireChange ? (
            <form
              onSubmit={handlePasswordChange}
              className="space-y-4 animate-in slide-in-from-right-4"
            >
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-500 rounded-md flex items-start gap-2 mb-4 text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>
                  Por questões de segurança, você precisa alterar a senha inicial fornecida pelo
                  administrador.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Mínimo de 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full bg-[#1E40AF] hover:bg-[#1E40AF]/90">
                Atualizar Senha e Entrar
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="carlos@asaf.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-[#1E40AF] hover:bg-[#1E40AF]/90">
                  Entrar
                </Button>
              </form>
              <div className="mt-6 text-sm text-center text-muted-foreground border-t border-border/50 pt-6">
                <p>Contas de demonstração:</p>
                <div className="mt-2 space-y-1 text-xs">
                  <p>
                    Admin: <span className="font-medium text-foreground">carlos@asaf.com</span>{' '}
                    (Senha: 123456)
                  </p>
                  <p>
                    Vendedor: <span className="font-medium text-foreground">ana@asaf.com</span>{' '}
                    (Senha: 123456)
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
