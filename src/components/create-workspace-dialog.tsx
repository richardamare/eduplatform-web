import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { effectTsResolver } from '@hookform/resolvers/effect-ts'
import { Schema } from 'effect'
import { useModal } from '@/hooks/use-modal'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { WorkspaceQueries } from '@/data-access/workspace-queries'
import { CreateWorkspacePayload } from '@/types/workspace'

const formSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(1),
    Schema.maxLength(50),
    Schema.filter((name) => {
      const isValid = name.match(/^[a-zA-Z0-9\s-_]+$/)
      if (!isValid) return false
      return name.length >= 3 && name.length <= 50
    }),
  ),
})

type FormData = typeof formSchema.Type

interface CreateWorkspaceDialogProps {
  id: string
}

export const CreateWorkspaceDialog = ({ id }: CreateWorkspaceDialogProps) => {
  const modal = useModal((s) => s.get(id))
  const close = useModal((s) => s.close)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: effectTsResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  const createWorkspaceMutation = WorkspaceQueries.useCreateWorkspace({
    onSuccess: () => {
      form.reset()
      setIsSubmitting(false)
      close(id)
    },
    onError: (error) => {
      setIsSubmitting(false)
      form.setError('name', {
        type: 'manual',
        message: error.message || 'Failed to create workspace',
      })
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset()
      close(id)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    const payload = new CreateWorkspacePayload({ name: data.name })
    createWorkspaceMutation.mutate(payload)
  }

  if (!modal.isOpen) return null

  return (
    <Dialog open={modal.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter workspace name..."
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
