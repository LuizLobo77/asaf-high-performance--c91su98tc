import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import type { Industry } from '@/lib/types'
import useAppStore from '@/stores/useAppStore'

interface EditIndustryDialogProps {
  industry: Industry | null
  onClose: () => void
}

export function EditIndustryDialog({ industry, onClose }: EditIndustryDialogProps) {
  const { updateIndustry } = useAppStore()
  const [name, setName] = useState('')
  const [commission, setCommission] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (industry) {
      setName(industry.name)
      setCommission((industry.commissionPercent * 100).toFixed(2).replace(/\.00$/, ''))
      setError('')
    }
  }, [industry])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!industry) return

    const commVal = Number(commission)
    if (isNaN(commVal) || commVal < 0) {
      setError('A comissão deve ser um número válido maior ou igual a 0.')
      return
    }

    updateIndustry(industry.id, {
      name,
      commissionPercent: commVal / 100,
    })

    toast({ title: 'Indústria atualizada com sucesso.' })
    onClose()
  }

  return (
    <Dialog open={!!industry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Indústria</DialogTitle>
          <DialogDescription>
            Atualize as informações. As comissões de pedidos anteriores não serão afetadas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome da Indústria</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-commission">Percentual de Comissão Padrão (%)</Label>
            <Input
              id="edit-commission"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={commission}
              onChange={(e) => {
                setCommission(e.target.value)
                setError('')
              }}
              placeholder="Ex: 5.5"
              required
            />
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </div>
          <Button type="submit" className="w-full">
            Salvar Alterações
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
