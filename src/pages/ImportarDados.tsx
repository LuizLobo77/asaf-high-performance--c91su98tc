import useAppStore from '@/stores/useAppStore'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ClientImport from '@/components/import/ClientImport'
import VisitImport from '@/components/import/VisitImport'

export default function ImportarDados() {
  const { currentUser } = useAppStore()

  if (!currentUser) return null

  if (currentUser.role !== 'gestor') {
    return <div className="text-center py-20 text-destructive font-bold text-xl">Acesso Negado</div>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E40AF]">Importar Dados</h1>
        <p className="text-muted-foreground mt-1">
          Sincronize as informações de vendas e gerencie importações em massa de forma otimizada.
        </p>
      </div>

      <Tabs defaultValue="clientes" className="w-full">
        <TabsList className="mb-6 bg-muted/50 p-1">
          <TabsTrigger
            value="clientes"
            className="px-6 data-[state=active]:bg-white data-[state=active]:text-[#1E40AF]"
          >
            Clientes
          </TabsTrigger>
          <TabsTrigger
            value="visitas"
            className="px-6 data-[state=active]:bg-white data-[state=active]:text-[#1E40AF]"
          >
            Visitas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="mt-0">
          <ClientImport />
        </TabsContent>

        <TabsContent value="visitas" className="mt-0">
          <VisitImport />
        </TabsContent>
      </Tabs>
    </div>
  )
}
