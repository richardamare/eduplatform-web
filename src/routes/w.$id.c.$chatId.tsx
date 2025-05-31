import { createFileRoute } from '@tanstack/react-router'
import { mockChats } from '@/lib/mock-data'
import { ChatDetail } from '@/components/chat-detail'

export const Route = createFileRoute('/w/$id/c/$chatId')({
  component: ChatPage,
})

function ChatPage() {
  const { chatId } = Route.useParams()
  const chat = mockChats.find((c) => c.id === chatId)

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Chat not found</h1>
        </div>
      </div>
    )
  }

  return <ChatDetail chat={chat} />
}
