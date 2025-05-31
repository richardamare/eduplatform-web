import { useEffect, useRef } from 'react'
import type { Chat } from '@/types/chat'
import { MessageList } from '@/components/message-list'
import { ChatInput } from '@/components/chat-input'
import { useChat } from '@/data-access/use-chat'
import { MessageRole } from '@/types/message'

interface ChatDetailProps {
  chat: Chat
}

export const ChatDetail = ({ chat }: ChatDetailProps) => {
  const {
    messages,
    append,
    isLoading,
    status,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
  } = useChat({
    id: chat.id,
  })

  const scrollRef = useRef<HTMLDivElement>(null)

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
