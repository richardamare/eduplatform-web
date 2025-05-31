import { createFileRoute } from '@tanstack/react-router'
import { ChatInput } from '@/components/chat-input'

export const Route = createFileRoute('/w/$id/c/new')({
  component: NewChatPage,
})

function NewChatPage() {
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
        <ChatInput />
      </div>
    </div>
  )
}
