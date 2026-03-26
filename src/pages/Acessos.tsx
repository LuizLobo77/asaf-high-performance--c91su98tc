import { useState } from 'react'
import { Edit2, Shield, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAppStore from '@/stores/useAppStore'
import { toast } from '@/hooks/use-toast'
import type { User, Role } from '@/lib/types'

export default function Acessos() {
  const { currentUser, users, addUser, updateUser } = useAppStore()

  const [isOpen, setIsOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('vendedor')
  const [password, setPassword] = useState('')

  if (!currentUser) return null

  if (currentUser.role !== 'gestor') {
    return <div className="text-center py-20 text-destructive font-bold text-xl">Acesso Negado</div>
  }

  const handleOpenNew = () => {
    setEditingUser(null)
    setName('')
    setEmail('')
    setPhone('')
    setRole('vendedor')
    setPassword('')
    setIsOpen(true)
  }

  const handleOpenEdit = (user: User) => {
    setEditingUser(user)
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone || '')
    setRole(user.role)
    setPassword('')
    setIsOpen(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return

    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        email,
        phone,
        role,
        ...(password ? { password, mustChangePassword: true } : {}),
      })
      toast({ title: 'Credenciais e dados atualizados com sucesso.' })
    } else {
      addUser({
        id: `u-${Date.now()}`,
        name,
        email,
        phone,
        role,
        status: 'active',
        password: password || 'Mudar@123',
        mustChangePassword: true,
        target: 0,
      })
      toast({ title: 'Novo usuário criado com sucesso.' })
    }
    setIsOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E40AF]">Gestão de Acessos</h1>
          <p className="text-muted-foreground mt-1">
            Administre os usuários do sistema, permissões e redefinição de senhas.
          </p>
        </div>
        <Button onClick={handleOpenNew} className="bg-[#1E40AF] hover:bg-[#1E40AF]/90">
          <Plus className="w-4 h-4 mr-2" /> Novo Usuário
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Credenciais de Sistema
          </CardTitle>
          <CardDescription>
            Gerencie o acesso de todos os colaboradores na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className={u.status === 'inactive' ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={u.status === 'active' ? 'default' : 'secondary'}
                      className={u.status === 'active' ? 'bg-success hover:bg-success/90' : ''}
                    >
                      {u.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(u)}
                      title="Editar Usuário / Redefinir Senha"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Atualize os dados ou force a redefinição de senha.'
                : 'Cadastre credenciais para um novo colaborador.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email de Acesso</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Nível de Acesso</Label>
                <Select value={role} onValueChange={(val) => setRole(val as Role)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="gestor">Administrador (Gestor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-border/50">
              <Label htmlFor="password" className="text-destructive font-semibold">
                {editingUser ? 'Redefinir Senha' : 'Senha Inicial'}
              </Label>
              <Input
                id="password"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  editingUser
                    ? 'Deixe em branco para não alterar'
                    : 'Senha temporária (ex: Mudar@123)'
                }
              />
              <p className="text-xs text-muted-foreground">
                O usuário será obrigado a criar uma nova senha no próximo login.
              </p>
            </div>

            <Button type="submit" className="w-full mt-4 bg-[#1E40AF] hover:bg-[#1E40AF]/90">
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
