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
import { GeneratedContentQueries } from '@/data-access/generated-content'
import { WorkspaceId } from '@/types/workspace'
import { useQueryClient } from '@tanstack/react-query'

const generateFlashcardsSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(100, 'Topic too long'),
})

type GenerateFlashcardsForm = z.infer<typeof generateFlashcardsSchema>

interface GenerateFlashcardsDialogProps {
  id: string
  workspaceId: string
}

export function GenerateFlashcardsDialog({
  id,
  workspaceId,
}: GenerateFlashcardsDialogProps) {
  const { get, close } = useModal()
  const modal = get(id)
  const [isLoading, setIsLoading] = useState(false)

  const queryClient = useQueryClient()

  const createFlashcardMutation = GeneratedContentQueries.useCreate({
    onSuccess: () => {
      handleClose()
      queryClient.invalidateQueries({
        queryKey: GeneratedContentQueries.queryKeys.flashcards(
          WorkspaceId.make(workspaceId),
        ),
      })
    },
  })

  const form = useForm<GenerateFlashcardsForm>({
    resolver: zodResolver(generateFlashcardsSchema),
    defaultValues: {
      topic: '',
    },
  })

  const handleClose = () => {
    close(id)
    form.reset()
  }

  const onSubmit = async (data: GenerateFlashcardsForm) => {
    try {
      setIsLoading(true)

      createFlashcardMutation.mutate({
        workspaceId: WorkspaceId.make(workspaceId),
        topic: data.topic,
      })

      handleClose()
    } catch (error) {
      console.error('Failed to generate flashcards:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={modal?.isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Flashcards</DialogTitle>
          <DialogDescription>
            Enter a topic to generate AI-powered flashcards for your workspace.
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
                      placeholder="e.g., JavaScript basics, Ancient Rome, Calculus..."
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
                {isLoading ? 'Generating...' : 'Generate Flashcards'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
