import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { Chat, type ChatId } from '@/types/chat'
import {
  Message,
  type MessageId,
  MessageRole,
  type CreateMessagePayload,
} from '@/types/message'
import { type WorkspaceId } from '@/types/workspace'
import { mockChats } from '@/lib/mock-data'

// API functions (replace with actual API calls)
const chatApi = {
  async getChats(workspaceId: WorkspaceId): Promise<Array<Chat>> {
    // Simulate API call - replace with actual API
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock data - replace with actual API call
    return [
      new Chat({
        id: `chat_${workspaceId}_1` as ChatId,
        name: 'Getting Started',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Chat({
        id: `chat_${workspaceId}_2` as ChatId,
        name: 'Advanced Topics',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]
  },

  async createChat(workspaceId: WorkspaceId, name: string): Promise<Chat> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    return new Chat({
      id: `chat_${workspaceId}_${Date.now()}` as ChatId,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  },

  async getChat(chatId: ChatId): Promise<Chat> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Mock implementation - replace with actual API
    const chat = mockChats.find((chat) => chat.id === chatId)
    if (!chat) {
      throw new Error(`Chat with id ${chatId} not found`)
    }
    return chat
  },

  async getMessages(chatId: ChatId): Promise<Array<Message>> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Mock messages
    return [
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
  },

  async sendMessage(
    chatId: ChatId,
    content: string,
    options?: { headers?: Record<string, string>; body?: object },
  ): Promise<Message> {
    // Add user message first
    const userMessage = new Message({
      id: `msg_${Date.now()}` as MessageId,
      content,
      role: MessageRole.USER,
      createdAt: new Date(),
    })

    // Simulate API call for response
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Return assistant response
    return new Message({
      id: `msg_${Date.now() + 1}` as MessageId,
      content: `I understand you said: "${content}". How can I help you further?`,
      role: MessageRole.ASSISTANT,
      createdAt: new Date(),
    })
  },

  async streamMessage(
    chatId: ChatId,
    content: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<Message> {
    const assistantMessageId = `msg_${Date.now()}` as MessageId

    try {
      const response = await fetch('http://localhost:5131/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
        }),
        ...(signal && { signal }),
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

      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          // Decode the chunk as plain text
          const chunk = decoder.decode(value, { stream: true })

          // Accumulate the content and call onChunk with the new total
          accumulatedContent += chunk
          onChunk(accumulatedContent)
        }
      } finally {
        reader.releaseLock()
      }

      return new Message({
        id: assistantMessageId,
        content: accumulatedContent,
        role: MessageRole.ASSISTANT,
        createdAt: new Date(),
      })
    } catch (error) {
      if (signal?.aborted) {
        throw new Error('Stream aborted')
      }
      throw error
    }
  },
}

export namespace ChatQueries {
  // Query Keys
  export const queryKeys = {
    all: ['chats'],
    lists: () => [...queryKeys.all, 'list'],
    list: (workspaceId: WorkspaceId) => [...queryKeys.lists(), workspaceId],
    details: () => [...queryKeys.all, 'detail'],
    detail: (id: ChatId) => [...queryKeys.details(), id],
    messages: () => [...queryKeys.all, 'messages'],
    messagesList: (chatId: ChatId) => [...queryKeys.messages(), chatId],
  }

  // Types
  export type ChatsQueryOptions = Omit<
    UseQueryOptions<Array<Chat>, Error, Array<Chat>>,
    'queryKey' | 'queryFn'
  >

  export type ChatQueryOptions = Omit<
    UseQueryOptions<Chat, Error, Chat>,
    'queryKey' | 'queryFn'
  >

  export type MessagesQueryOptions = Omit<
    UseQueryOptions<Array<Message>, Error, Array<Message>>,
    'queryKey' | 'queryFn'
  >

  export type CreateChatMutationOptions = Omit<
    UseMutationOptions<Chat, Error, { workspaceId: WorkspaceId; name: string }>,
    'mutationFn'
  >

  export type SendMessageMutationOptions = Omit<
    UseMutationOptions<
      { userMessage: Message; assistantMessage: Message },
      Error,
      {
        chatId: ChatId
        content: string
        options?: { headers?: Record<string, string>; body?: object }
      }
    >,
    'mutationFn'
  >

  export type StreamMessageMutationOptions = Omit<
    UseMutationOptions<
      Message,
      Error,
      { chatId: ChatId; content: string; onChunk: (chunk: string) => void }
    >,
    'mutationFn'
  >

  // Chat Hooks
  export const useChats = (
    workspaceId: WorkspaceId,
    options?: ChatsQueryOptions,
  ) => {
    return useQuery({
      queryKey: queryKeys.list(workspaceId),
      queryFn: () => chatApi.getChats(workspaceId),
      staleTime: 2 * 60 * 1000, // 2 minutes
      ...options,
    })
  }

  export const useChat = (chatId: ChatId, options?: ChatQueryOptions) => {
    return useQuery({
      queryKey: queryKeys.detail(chatId),
      queryFn: () => chatApi.getChat(chatId),
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }

  export const useCreateChat = (options?: CreateChatMutationOptions) => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: ({
        workspaceId,
        name,
      }: {
        workspaceId: WorkspaceId
        name: string
      }) => chatApi.createChat(workspaceId, name),
      onSuccess: (newChat, { workspaceId }) => {
        // Update the chats list cache for this workspace
        queryClient.setQueryData<Array<Chat>>(
          queryKeys.list(workspaceId),
          (oldChats = []) => [...oldChats, newChat],
        )

        // Set the individual chat cache
        queryClient.setQueryData(queryKeys.detail(newChat.id), newChat)

        // Optionally invalidate to refetch
        queryClient.invalidateQueries({
          queryKey: queryKeys.list(workspaceId),
        })
      },
      ...options,
    })
  }

  // Message Hooks
  export const useMessages = (
    chatId: ChatId,
    options?: MessagesQueryOptions,
  ) => {
    return useQuery({
      queryKey: queryKeys.messagesList(chatId),
      queryFn: () => chatApi.getMessages(chatId),
      staleTime: 1 * 60 * 1000, // 1 minute
      ...options,
    })
  }

  export const useSendMessage = (options?: SendMessageMutationOptions) => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({ chatId, content, options: requestOptions }) => {
        // Create user message immediately
        const userMessage = new Message({
          id: `msg_${Date.now()}` as MessageId,
          content,
          role: MessageRole.USER,
          createdAt: new Date(),
        })

        // Add user message to cache optimistically
        queryClient.setQueryData<Array<Message>>(
          queryKeys.messagesList(chatId),
          (oldMessages = []) => [...oldMessages, userMessage],
        )

        // Send message and get assistant response
        const assistantMessage = await chatApi.sendMessage(
          chatId,
          content,
          requestOptions,
        )

        return { userMessage, assistantMessage }
      },
      onSuccess: ({ assistantMessage }, { chatId }) => {
        // Add assistant message to cache
        queryClient.setQueryData<Array<Message>>(
          queryKeys.messagesList(chatId),
          (oldMessages = []) => [...oldMessages, assistantMessage],
        )
      },
      onError: (error, { chatId }) => {
        // Optionally remove the optimistic user message on error
        queryClient.invalidateQueries({
          queryKey: queryKeys.messagesList(chatId),
        })
      },
      ...options,
    })
  }

  export const useStreamMessage = (options?: StreamMessageMutationOptions) => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({ chatId, content, onChunk }) => {
        // Create user message immediately
        const userMessage = new Message({
          id: `msg_${Date.now()}` as MessageId,
          content,
          role: MessageRole.USER,
          createdAt: new Date(),
        })

        // Add user message to cache
        queryClient.setQueryData<Array<Message>>(
          queryKeys.messagesList(chatId),
          (oldMessages = []) => [...oldMessages, userMessage],
        )

        // Create empty assistant message for streaming
        const assistantMessageId = `msg_${Date.now() + 1}` as MessageId
        const initialAssistantMessage = new Message({
          id: assistantMessageId,
          content: '',
          role: MessageRole.ASSISTANT,
          createdAt: new Date(),
        })

        // Add empty assistant message
        queryClient.setQueryData<Array<Message>>(
          queryKeys.messagesList(chatId),
          (oldMessages = []) => [...oldMessages, initialAssistantMessage],
        )

        // Stream response and update incrementally
        const finalMessage = await chatApi.streamMessage(
          chatId,
          content,
          (chunk) => {
            // Update assistant message with accumulated content
            queryClient.setQueryData<Array<Message>>(
              queryKeys.messagesList(chatId),
              (oldMessages = []) =>
                oldMessages.map((msg) =>
                  msg.id === assistantMessageId
                    ? new Message({ ...msg, content: chunk })
                    : msg,
                ),
            )
            onChunk(chunk)
          },
        )

        return finalMessage
      },
      ...options,
    })
  }

  // Utility functions
  export const useChatById = (workspaceId: WorkspaceId, chatId: ChatId) => {
    const queryClient = useQueryClient()

    const getChatFromCache = (): Chat | null => {
      // First try individual cache
      const individualChat = queryClient.getQueryData<Chat>(
        queryKeys.detail(chatId),
      )
      if (individualChat) return individualChat

      // Then try from workspace chats list cache
      const chats = queryClient.getQueryData<Array<Chat>>(
        queryKeys.list(workspaceId),
      )
      return chats?.find((chat) => chat.id === chatId) || null
    }

    return {
      chat: getChatFromCache(),
      query: useChat(chatId, { enabled: !getChatFromCache() }),
    }
  }

  // Message utilities
  export const useAddMessage = () => {
    const queryClient = useQueryClient()

    return (chatId: ChatId, message: Message) => {
      queryClient.setQueryData<Array<Message>>(
        queryKeys.messagesList(chatId),
        (oldMessages = []) => [...oldMessages, message],
      )
    }
  }

  export const useUpdateMessage = () => {
    const queryClient = useQueryClient()

    return (chatId: ChatId, messageId: MessageId, content: string) => {
      queryClient.setQueryData<Array<Message>>(
        queryKeys.messagesList(chatId),
        (oldMessages = []) =>
          oldMessages.map((msg) =>
            msg.id === messageId ? new Message({ ...msg, content }) : msg,
          ),
      )
    }
  }

  // Prefetch utilities
  export const usePrefetchChat = () => {
    const queryClient = useQueryClient()

    return (chatId: ChatId) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.detail(chatId),
        queryFn: () => chatApi.getChat(chatId),
        staleTime: 5 * 60 * 1000,
      })
    }
  }

  export const usePrefetchMessages = () => {
    const queryClient = useQueryClient()

    return (chatId: ChatId) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.messagesList(chatId),
        queryFn: () => chatApi.getMessages(chatId),
        staleTime: 1 * 60 * 1000,
      })
    }
  }

  // Cache management
  export const useInvalidateChats = () => {
    const queryClient = useQueryClient()

    return {
      invalidateAll: () =>
        queryClient.invalidateQueries({ queryKey: queryKeys.all }),
      invalidateWorkspaceChats: (workspaceId: WorkspaceId) =>
        queryClient.invalidateQueries({
          queryKey: queryKeys.list(workspaceId),
        }),
      invalidateChat: (chatId: ChatId) =>
        queryClient.invalidateQueries({ queryKey: queryKeys.detail(chatId) }),
      invalidateMessages: (chatId: ChatId) =>
        queryClient.invalidateQueries({
          queryKey: queryKeys.messagesList(chatId),
        }),
    }
  }
}
