import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { ChatInput } from '@/components/chat-input'
import { MessageList } from '@/components/message-list'
import { WorkspaceId } from '@/types/workspace'
import { ChatId } from '@/types/chat'
import { ChatQueries } from '@/data-access/chat'

export const Route = createFileRoute('/w/$id/c/$chatId')({
  component: ChatPage,
})

function ChatPage() {
  const { id, chatId } = Route.useParams()
  const scrollRef = useRef<HTMLDivElement>(null)
  // const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)

  const chatIdTyped = ChatId.make(chatId)
  const workspaceIdTyped = WorkspaceId.make(id)

  // Get chat and messages data
  const chatQuery = ChatQueries.useChat(workspaceIdTyped, chatIdTyped)
  const chat = chatQuery.data

  const messagesQuery = ChatQueries.useMessages(workspaceIdTyped, chatIdTyped)
  const messages = messagesQuery.data ?? []

  // Send message mutation with streaming support
  const streamMessage = ChatQueries.useStreamMessage({
    onMutate: () => setIsStreaming(true),
    onSettled: () => setIsStreaming(false),
    onSuccess: () => {
      document.getElementById('message-input')?.focus()
    },
  })

  const isLoading = messagesQuery.isLoading || streamMessage.isPending

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

    console.log('handleSend', {
      content,
      chatId: chatIdTyped,
      workspaceId: workspaceIdTyped,
    })

    await streamMessage.mutateAsync({
      workspaceId: workspaceIdTyped,
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
