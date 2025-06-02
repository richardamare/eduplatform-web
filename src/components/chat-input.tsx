import { PlusIcon, SendIcon } from 'lucide-react'
import type { FormEventHandler } from 'react'
import {
  AIInput,
  AIInputButton,
  AIInputSubmit,
  AIInputTextarea,
  AIInputToolbar,
  AIInputTools,
} from '@/components/ui/kibo-ui/ai/input'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend?: (message: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export const ChatInput = ({
  onSend,
  disabled = false,
  placeholder = 'What would you like to know?',
  className,
}: ChatInputProps) => {
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const message = formData.get('message') as string

    if (message && message.trim() && onSend) {
      onSend(message.trim())
      // Reset the form
      event.currentTarget.reset()
    }
  }

  return (
    <AIInput onSubmit={handleSubmit} className={cn(className)}>
      <AIInputTextarea placeholder={placeholder} disabled={disabled} />
      <AIInputToolbar>
        <AIInputTools>
          <AIInputButton>
            <PlusIcon size={16} />
          </AIInputButton>
        </AIInputTools>
        <AIInputSubmit disabled={disabled}>
          <SendIcon size={16} />
        </AIInputSubmit>
      </AIInputToolbar>
    </AIInput>
  )
}
