import type { StateCreator } from 'zustand'
import { Message, type MessageId, MessageRole } from '@/types/message'
import { type ChatId } from '@/types/chat'

export interface MessageState {
  // Data
  messages: Record<ChatId, Array<Message>>

  // Loading states
  loading: {
    messages: Record<ChatId, boolean>
    streaming: Record<ChatId, boolean>
  }

  // Error states
  errors: {
    messages: Record<ChatId, string | null>
    streaming: Record<ChatId, string | null>
  }

  // Actions
  loadMessages: (chatId: ChatId) => Promise<void>
  sendMessage: (chatId: ChatId, content: string) => Promise<void>
  streamMessage: (chatId: ChatId, content: string) => Promise<void>
  addMessage: (chatId: ChatId, message: Message) => void
  updateMessage: (chatId: ChatId, messageId: MessageId, content: string) => void
  getMessages: (chatId: ChatId) => Array<Message>
  clearMessageErrors: (chatId: ChatId) => void
  stopStreaming: (chatId: ChatId) => void
}

export const createMessageSlice: StateCreator<
  MessageState,
  [],
  [],
  MessageState
> = (set, get) => {
  const abortControllers: Record<ChatId, AbortController> = {}

  return {
    // Initial state
    messages: {},
    loading: {
      messages: {},
      streaming: {},
    },
    errors: {
      messages: {},
      streaming: {},
    },

    // Actions
    loadMessages: async (chatId: ChatId) => {
      set((state) => ({
        ...state,
        loading: {
          ...state.loading,
          messages: { ...state.loading.messages, [chatId]: true },
        },
        errors: {
          ...state.errors,
          messages: { ...state.errors.messages, [chatId]: null },
        },
      }))

      try {
        // Simulate API call - replace with actual API
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Mock data - replace with actual API call
        const mockMessages = [
          new Message({
            id: `msg_${chatId}_1` as MessageId,
            content: 'Hello! How can I help you today?',
            role: MessageRole.ASSISTANT,
            createdAt: new Date(Date.now() - 60000),
          }),
          new Message({
            id: `msg_${chatId}_2` as MessageId,
            content: 'I need help with understanding React hooks.',
            role: MessageRole.USER,
            createdAt: new Date(Date.now() - 30000),
          }),
        ]

        set((state) => ({
          ...state,
          messages: {
            ...state.messages,
            [chatId]: mockMessages,
          },
          loading: {
            ...state.loading,
            messages: { ...state.loading.messages, [chatId]: false },
          },
        }))
      } catch (error) {
        set((state) => ({
          ...state,
          loading: {
            ...state.loading,
            messages: { ...state.loading.messages, [chatId]: false },
          },
          errors: {
            ...state.errors,
            messages: {
              ...state.errors.messages,
              [chatId]:
                error instanceof Error
                  ? error.message
                  : 'Failed to load messages',
            },
          },
        }))
      }
    },

    sendMessage: async (chatId: ChatId, content: string) => {
      const userMessageId = `msg_${Date.now()}`

      // Add user message immediately
      const userMessage = new Message({
        id: userMessageId as MessageId,
        content,
        role: MessageRole.USER,
        createdAt: new Date(),
      })

      set((state) => ({
        ...state,
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] ?? []), userMessage],
        },
      }))

      // Start streaming response
      await get().streamMessage(chatId, content)
    },

    streamMessage: async (chatId: ChatId, content: string) => {
      const assistantMessageId = `msg_${Date.now() + 1}`

      // Create abort controller for this stream
      abortControllers[chatId] = new AbortController()

      set((state) => ({
        ...state,
        loading: {
          ...state.loading,
          streaming: { ...state.loading.streaming, [chatId]: true },
        },
        errors: {
          ...state.errors,
          streaming: { ...state.errors.streaming, [chatId]: null },
        },
      }))

      // Add empty assistant message
      const assistantMessage = new Message({
        id: assistantMessageId as MessageId,
        content: '',
        role: MessageRole.ASSISTANT,
        createdAt: new Date(),
      })

      set((state) => ({
        ...state,
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] ?? []), assistantMessage],
        },
      }))

      try {
        // Simulate streaming API call
        const response = await fetch('/api/chat/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: content, chatId }),
          signal: abortControllers[chatId].signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No reader available')
        }

        const decoder = new TextDecoder()
        let accumulatedContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk

          // Update assistant message incrementally
          set((state) => {
            const currentMessages = state.messages[chatId] ?? []
            const updatedMessages = currentMessages.map((msg) =>
              msg.id === assistantMessageId
                ? new Message({ ...msg, content: accumulatedContent })
                : msg,
            )

            return {
              ...state,
              messages: {
                ...state.messages,
                [chatId]: updatedMessages,
              },
            }
          })
        }

        reader.releaseLock()

        set((state) => ({
          ...state,
          loading: {
            ...state.loading,
            streaming: { ...state.loading.streaming, [chatId]: false },
          },
        }))
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // Stream was aborted, just stop loading
          set((state) => ({
            ...state,
            loading: {
              ...state.loading,
              streaming: { ...state.loading.streaming, [chatId]: false },
            },
          }))
          return
        }

        // Remove failed assistant message
        set((state) => ({
          ...state,
          messages: {
            ...state.messages,
            [chatId]: (state.messages[chatId] ?? []).filter(
              (msg) => msg.id !== assistantMessageId,
            ),
          },
          loading: {
            ...state.loading,
            streaming: { ...state.loading.streaming, [chatId]: false },
          },
          errors: {
            ...state.errors,
            streaming: {
              ...state.errors.streaming,
              [chatId]:
                error instanceof Error
                  ? error.message
                  : 'Failed to stream message',
            },
          },
        }))
      } finally {
        delete abortControllers[chatId]
      }
    },

    addMessage: (chatId: ChatId, message: Message) => {
      set((state) => ({
        ...state,
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] ?? []), message],
        },
      }))
    },

    updateMessage: (chatId: ChatId, messageId: MessageId, content: string) => {
      set((state) => {
        const currentMessages = state.messages[chatId] ?? []
        const updatedMessages = currentMessages.map((msg) =>
          msg.id === messageId ? new Message({ ...msg, content }) : msg,
        )

        return {
          ...state,
          messages: {
            ...state.messages,
            [chatId]: updatedMessages,
          },
        }
      })
    },

    getMessages: (chatId: ChatId) => {
      return get().messages[chatId] ?? []
    },

    clearMessageErrors: (chatId: ChatId) => {
      set((state) => ({
        ...state,
        errors: {
          ...state.errors,
          messages: { ...state.errors.messages, [chatId]: null },
          streaming: { ...state.errors.streaming, [chatId]: null },
        },
      }))
    },

    stopStreaming: (chatId: ChatId) => {
      if (abortControllers[chatId]) {
        abortControllers[chatId].abort()
        delete abortControllers[chatId]
      }

      set((state) => ({
        ...state,
        loading: {
          ...state.loading,
          streaming: { ...state.loading.streaming, [chatId]: false },
        },
      }))
    },
  }
}
