import { GlobeIcon, MicIcon, PlusIcon, SendIcon } from 'lucide-react'
import { useState } from 'react'
import type { FormEventHandler } from 'react'
import {
  AIInput,
  AIInputButton,
  AIInputModelSelect,
  AIInputModelSelectContent,
  AIInputModelSelectItem,
  AIInputModelSelectTrigger,
  AIInputModelSelectValue,
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

const models = [
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'claude-2', name: 'Claude 2' },
  { id: 'claude-instant', name: 'Claude Instant' },
  { id: 'palm-2', name: 'PaLM 2' },
  { id: 'llama-2-70b', name: 'Llama 2 70B' },
  { id: 'llama-2-13b', name: 'Llama 2 13B' },
  { id: 'cohere-command', name: 'Command' },
  { id: 'mistral-7b', name: 'Mistral 7B' },
]

export const ChatInput = ({
  onSend,
  disabled = false,
  placeholder = 'What would you like to know?',
  className,
}: ChatInputProps) => {
  const [selectedModel, setSelectedModel] = useState<string>(models[0].id)

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
          <AIInputButton>
            <MicIcon size={16} />
          </AIInputButton>
          <AIInputButton>
            <GlobeIcon size={16} />
            <span>Search</span>
          </AIInputButton>
          <AIInputModelSelect
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <AIInputModelSelectTrigger>
              <AIInputModelSelectValue />
            </AIInputModelSelectTrigger>
            <AIInputModelSelectContent>
              {models.map((model) => (
                <AIInputModelSelectItem key={model.id} value={model.id}>
                  {model.name}
                </AIInputModelSelectItem>
              ))}
            </AIInputModelSelectContent>
          </AIInputModelSelect>
        </AIInputTools>
        <AIInputSubmit disabled={disabled}>
          <SendIcon size={16} />
        </AIInputSubmit>
      </AIInputToolbar>
    </AIInput>
  )
}
