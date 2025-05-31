import { useModal } from '@/hooks/use-modal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CreateWorkspaceDialogProps {
  id: string
}

export const CreateWorkspaceDialog = ({ id }: CreateWorkspaceDialogProps) => {
  const modal = useModal((s) => s.get(id))
  const close = useModal((s) => s.close)

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close(id)
    }
  }

  if (!modal.isOpen) return null

  return (
    <Dialog open={modal.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
