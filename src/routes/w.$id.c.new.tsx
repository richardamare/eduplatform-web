import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ChatInput } from '@/components/chat-input'
import { ChatQueries } from '@/data-access/chat-queries'
import { type WorkspaceId } from '@/types/workspace'

export const Route = createFileRoute('/w/$id/c/new')({
  component: NewChatPage,
})

function NewChatPage() {
  const { id: workspaceId } = Route.useParams()
  const router = useRouter()

  const createChatMutation = ChatQueries.useCreateChat()
  const streamMessageMutation = ChatQueries.useStreamMessage()

  const handleSend = async (message: string) => {
    try {
      // Create new chat
      const newChat = await createChatMutation.mutateAsync({
        workspaceId: workspaceId as WorkspaceId,
      })

      // Navigate to the new chat
      await router.navigate({
        to: '/w/$id/c/$chatId',
        params: { id: workspaceId, chatId: newChat.id },
      })

      // Send the message
      streamMessageMutation.mutate({
        workspaceId: workspaceId as WorkspaceId,
        chatId: newChat.id,
        content: message,
        onChunk: () => {}, // No-op for navigation case
      })
    } catch (error) {
      console.error('Failed to create chat and send message:', error)
    }
  }

  const isLoading =
    createChatMutation.isPending || streamMessageMutation.isPending

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Start a new conversation</h2>
          <p className="text-muted-foreground">
            Type your first message below to begin
          </p>
        </div>
      </div>

      <div className="border-t p-4">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  )
}
