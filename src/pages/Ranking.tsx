import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import useAppStore from '@/stores/useAppStore'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'

export default function Ranking() {
  const { currentUser } = useAppStore()
  const metrics = useDashboardMetrics()

  if (currentUser.role !== 'gestor') {
    return <div className="text-center py-20 text-destructive font-bold text-xl">Acesso Negado</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ranking de Performance</h1>
        <p className="text-muted-foreground mt-1">Comparativo detalhado entre os vendedores.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Resultado Geral</CardTitle>
          <CardDescription>Classificado pelo total de vendas (R$)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Pos</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead className="text-right">Visitas</TableHead>
                <TableHead className="text-right">Conversão</TableHead>
                <TableHead className="text-right">Ticket Médio</TableHead>
                <TableHead className="text-right">Vendas (R$)</TableHead>
                <TableHead className="text-right">Meta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.sellerPerformance.map((seller, index) => {
                const progress = seller.target ? (seller.actual / seller.target) * 100 : 0
                return (
                  <TableRow key={seller.id}>
                    <TableCell className="font-bold">{index + 1}º</TableCell>
                    <TableCell className="font-medium">{seller.name}</TableCell>
                    <TableCell className="text-right">{seller.visits}</TableCell>
                    <TableCell className="text-right">{seller.conversion.toFixed(1)}%</TableCell>
                    <TableCell className="text-right">
                      R${' '}
                      {seller.averageTicket.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      R$ {seller.actual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          progress >= 100 ? 'default' : progress >= 80 ? 'secondary' : 'destructive'
                        }
                        className={
                          progress >= 100
                            ? 'bg-success text-success-foreground hover:bg-success/90'
                            : ''
                        }
                      >
                        {progress.toFixed(0)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
