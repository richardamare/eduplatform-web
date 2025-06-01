import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { MessageRole } from '@/types/message'
import { ChatInput } from '@/components/chat-input'
import { MessageList } from '@/components/message-list'
import { WorkspaceId } from '@/types/workspace'
import { ChatId } from '@/types/chat'
import { ChatQueries } from '@/data-access/chat-queries'

export const Route = createFileRoute('/w/$id/c/$chatId')({
  component: ChatPage,
})

function ChatPage() {
  const { id, chatId } = Route.useParams()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const chatIdTyped = ChatId.make(chatId)

  // Get chat and messages data
  const chatQuery = ChatQueries.useChat(chatIdTyped)
  const chat = chatQuery.data

  const { data: messages = [], isLoading: messagesLoading } =
    ChatQueries.useMessages(chatIdTyped)

  // Send message mutation with streaming support
  const streamMessage = ChatQueries.useStreamMessage({
    onMutate: () => setIsStreaming(true),
    onSettled: () => setIsStreaming(false),
    onSuccess: () => setInput(''),
  })

  const isLoading = messagesLoading || streamMessage.isPending

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  const handleSend = async (content: string) => {
    if (!content.trim()) return

    await streamMessage.mutateAsync({
      chatId: chatIdTyped,
      content: content.trim(),
      onChunk: (chunk) => {
        // Real-time content updates handled by the mutation
      },
    })
  }

  const isWaitingForResponse = isStreaming || streamMessage.isPending

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
          disabled={isLoading || isWaitingForResponse}
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
