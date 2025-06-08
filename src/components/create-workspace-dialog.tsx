import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useModal } from '@/hooks/use-modal'
import { useQueryClient } from '@tanstack/react-query'
import { WorkspaceQueries } from '@/data-access/workspace'

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
})

type CreateWorkspaceForm = z.infer<typeof createWorkspaceSchema>

interface CreateWorkspaceDialogProps {
  id: string
}

export function CreateWorkspaceDialog({ id }: CreateWorkspaceDialogProps) {
  const { get, close } = useModal()
  const modal = get(id)
  const [isLoading, setIsLoading] = useState(false)

  const queryClient = useQueryClient()

  const createWorkspaceMutation = WorkspaceQueries.useCreateWorkspace({
    onSuccess: () => {
      handleClose()
      queryClient.invalidateQueries({
        queryKey: WorkspaceQueries.queryKeys.lists(),
      })
    },
  })

  const form = useForm<CreateWorkspaceForm>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
    },
  })

  const handleClose = () => {
    close(id)
    form.reset()
  }

  const onSubmit = async (data: CreateWorkspaceForm) => {
    try {
      setIsLoading(true)

      createWorkspaceMutation.mutate({
        _tag: 'CreateWorkspacePayload',
        name: data.name,
      })

      handleClose()
    } catch (error) {
      console.error('Failed to generate exam:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={modal?.isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Exam</DialogTitle>
          <DialogDescription>
            Enter a topic to generate AI-powered exam questions for your
            workspace.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., My Workspace" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Workspace'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
