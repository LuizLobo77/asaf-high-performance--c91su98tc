import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Client } from '@/lib/types'
import useAppStore from '@/stores/useAppStore'
import { toast } from '@/hooks/use-toast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  selected: Set<string>
  onClearSelection: () => void
}

export function ClientDeleteModal({
  open,
  onOpenChange,
  client,
  selected,
  onClearSelection,
}: Props) {
  const { deleteClient } = useAppStore()

  const confirm = async () => {
    try {
      if (client) {
        await deleteClient(client.id)
        toast({ title: 'Sucesso', description: 'Cliente excluído com sucesso' })
      } else if (selected.size > 0) {
        await Promise.all(Array.from(selected).map((id) => deleteClient(id)))
        toast({
          title: 'Sucesso',
          description: `Cliente excluído com sucesso`,
        })
        onClearSelection()
      }
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao tentar excluir os dados.',
        variant: 'destructive',
      })
    } finally {
      onOpenChange(false)
    }
  }

  const isBulk = !client

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] sm:max-w-[425px] rounded-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            {isBulk
              ? `Excluir ${selected.size} clientes selecionados?`
              : `Excluir ${client?.name}? Esta ação não pode ser desfeita.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={() => onOpenChange(false)} className="mt-0">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={confirm}
            className="bg-red-600 hover:bg-red-700 text-white border-transparent"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
