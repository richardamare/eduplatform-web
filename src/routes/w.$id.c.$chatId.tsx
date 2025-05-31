import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { useChat } from '@/data-access/use-chat'
import { MessageRole } from '@/types/message'
import { ChatInput } from '@/components/chat-input'
import { MessageList } from '@/components/message-list'
import { ChatQueries } from '@/data-access/chat'
import { WorkspaceId } from '@/types/workspace'
import { ChatId } from '@/types/chat'

export const Route = createFileRoute('/w/$id/c/$chatId')({
  component: ChatPage,
})

function ChatPage() {
  const { id, chatId } = Route.useParams()
  const scrollRef = useRef<HTMLDivElement>(null)

  const chatQuery = ChatQueries.useChatDetail(
    WorkspaceId.make(id),
    ChatId.make(chatId),
  )
  const chat = chatQuery.data

  const { messages, append, isLoading, status } = useChat({
    id: chat?.id,
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  const handleSend = async (content: string) => {
    await append({
      content,
      role: MessageRole.USER,
    })
  }

  const isWaitingForResponse = status === 'streaming' || status === 'submitted'

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Chat not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-22 pb-40">
        <MessageList messages={messages} />
      </div>

      <div className="absolute right-8 bottom-8 left-8 w-auto">
        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
          className="max-w-4xl mx-auto"
          placeholder={
            isWaitingForResponse
              ? 'Waiting for response...'
              : 'Type your message...'
          }
        />
      </div>
    </div>
  )
}
