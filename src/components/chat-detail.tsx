import type { Chat } from '@/types/chat'
import { MessageList } from '@/components/message-list'
import { ChatInput } from '@/components/chat-input'
import { useChat } from '@/data-access/use-chat'

interface ChatDetailProps {
  chat: Chat
}

export const ChatDetail = ({ chat }: ChatDetailProps) => {
  const { messages, send, isWaitingForResponse, isSending } = useChat({
    chatId: chat.id,
  })

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <h2 className="text-xl font-semibold">{chat.name}</h2>
        <p className="text-sm text-muted-foreground">
          Created {new Date(chat.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList messages={messages} />
      </div>

      <div className="border-t p-4">
        <ChatInput
          onSend={send}
          disabled={isSending || isWaitingForResponse}
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
