import type { Message } from '@/types/message'
import {
  AIMessage,
  AIMessageAvatar,
  AIMessageContent,
} from '@/components/ui/kibo-ui/ai/message'
import { AIResponse } from '@/components/ui/kibo-ui/ai/response'

interface MessageListProps {
  messages: Array<Message>
}

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <>
      {messages.map(({ content, ...message }, index) => (
        <AIMessage
          key={index}
          from={message.role === 'user' ? 'user' : 'assistant'}
        >
          {message.role === 'user' ? (
            <AIMessageContent>{content}</AIMessageContent>
          ) : (
            <AIResponse>{content}</AIResponse>
          )}
          <AIMessageAvatar
            src={
              message.role === 'user'
                ? 'https://github.com/haydenbleasel.png'
                : 'https://github.com/openai.png'
            }
            name={message.role === 'user' ? 'User' : 'Assistant'}
          />
        </AIMessage>
      ))}

      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <p>No messages yet. Start a conversation!</p>
        </div>
      )}
    </>
  )
}
