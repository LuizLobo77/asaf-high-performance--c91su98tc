import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash } from 'lucide-react'
import { Client } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  clients: Client[]
  isLoading: boolean
  isAdmin: boolean
  selected: Set<string>
  onSelect: (selected: Set<string>) => void
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export function ClientTable({
  clients,
  isLoading,
  isAdmin,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  const toggleAll = (checked: boolean) => {
    if (checked) onSelect(new Set(clients.map((c) => c.id)))
    else onSelect(new Set())
  }

  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(id)
    else next.delete(id)
    onSelect(next)
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {isAdmin && (
              <TableHead className="w-[40px] px-4">
                <Checkbox
                  checked={clients.length > 0 && selected.size === clients.length}
                  onCheckedChange={toggleAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
            )}
            <TableHead className="min-w-[200px]">Razão Social</TableHead>
            <TableHead className="min-w-[140px]">CNPJ</TableHead>
            <TableHead className="min-w-[120px]">Cidade</TableHead>
            <TableHead className="min-w-[120px]">Região</TableHead>
            <TableHead className="min-w-[130px]">Última Compra</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="min-w-[100px] text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={isAdmin ? 8 : 7} className="px-4 py-3">
                  <Skeleton className="h-6 w-full" />
                </TableCell>
              </TableRow>
            ))
          ) : clients.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isAdmin ? 8 : 7}
                className="text-center py-12 text-muted-foreground"
              >
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow
                key={client.id}
                className={client.deletedAt ? 'opacity-60 bg-muted/30' : ''}
              >
                {isAdmin && (
                  <TableCell className="px-4">
                    <Checkbox
                      checked={selected.has(client.id)}
                      onCheckedChange={(c) => toggleOne(client.id, !!c)}
                      aria-label={`Selecionar ${client.name}`}
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">
                  {client.name}
                  {client.deletedAt && (
                    <span className="ml-2 text-xs text-red-500 font-normal">(Excluído)</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{client.cnpj || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{client.city || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{client.region || '-'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {client.lastPurchase ? new Date(client.lastPurchase).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={client.status === 'inactive' ? 'secondary' : 'outline'}
                    className={
                      client.status === 'active'
                        ? 'border-green-500/50 text-green-600 bg-green-50 dark:bg-green-950/50'
                        : ''
                    }
                  >
                    {client.status === 'inactive' ? 'Inativo' : 'Ativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(client)}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(client)}
                        title="Excluir"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
