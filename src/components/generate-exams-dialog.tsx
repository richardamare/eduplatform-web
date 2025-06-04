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
import { DataItemQueries } from '@/data-access/data-item'
import { WorkspaceId } from '@/types/workspace'
import { useQueryClient } from '@tanstack/react-query'

const generateExamsSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(100, 'Topic too long'),
})

type GenerateExamsForm = z.infer<typeof generateExamsSchema>

interface GenerateExamsDialogProps {
  id: string
  workspaceId: string
}

export function GenerateExamsDialog({
  id,
  workspaceId,
}: GenerateExamsDialogProps) {
  const { get, close } = useModal()
  const modal = get(id)
  const [isLoading, setIsLoading] = useState(false)

  const queryClient = useQueryClient()

  const createExamMutation = DataItemQueries.useCreateExam({
    onSuccess: () => {
      handleClose()
      queryClient.invalidateQueries({
        queryKey: DataItemQueries.queryKeys.exams(
          WorkspaceId.make(workspaceId),
        ),
      })
    },
  })

  const form = useForm<GenerateExamsForm>({
    resolver: zodResolver(generateExamsSchema),
    defaultValues: {
      topic: '',
    },
  })

  const handleClose = () => {
    close(id)
    form.reset()
  }

  const onSubmit = async (data: GenerateExamsForm) => {
    try {
      setIsLoading(true)

      createExamMutation.mutate({
        workspaceId: WorkspaceId.make(workspaceId),
        topic: data.topic,
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
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., JavaScript fundamentals, European History, Algebra..."
                      {...field}
                    />
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
                {isLoading ? 'Generating...' : 'Generate Exam'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
