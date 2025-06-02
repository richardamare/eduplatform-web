import { createFileRoute } from '@tanstack/react-router'
import { ChatId } from '@/types/chat'

export const Route = createFileRoute('/w/$id/c/new')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const chatId = ChatId.make(id)

  return (
    <div>
      <h1>New Chat</h1>
      <p>Chat ID: {chatId.toString()}</p>
    </div>
  )
}
