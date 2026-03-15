import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import useAppStore from '@/stores/useAppStore'

export default function Clientes() {
  const { clients, users, currentUser } = useAppStore()

  const displayClients =
    currentUser.role === 'gestor' ? clients : clients.filter((c) => c.sellerId === currentUser.id)

  const getSellerName = (id: string) => users.find((u) => u.id === id)?.name || 'N/A'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground mt-1">Carteira de clientes cadastrados.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Total de {displayClients.length} clientes na base.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>Região</TableHead>
                {currentUser.role === 'gestor' && <TableHead>Vendedor Responsável</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.region}</TableCell>
                  {currentUser.role === 'gestor' && (
                    <TableCell className="text-muted-foreground">
                      {getSellerName(client.sellerId)}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {displayClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
