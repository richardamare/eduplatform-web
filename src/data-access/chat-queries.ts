import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { Chat, type ChatId } from '@/types/chat'
import { Message, type MessageId, MessageRole } from '@/types/message'
import { type WorkspaceId } from '@/types/workspace'

const API_BASE_URL = 'http://localhost:5131/api'

// API Response types
interface ChatResponse {
  id: string
  name: string
  workspaceId: string
  createdAt: string
  updatedAt: string
}

interface MessageResponse {
  id: string
  content: string
  role: 0 | 1
  createdAt: string
}

// API functions
const chatApi = {
  async getChats(workspaceId: WorkspaceId): Promise<Array<Chat>> {
    const response = await fetch(
      `${API_BASE_URL}/workspaces/${workspaceId}/chats`,
    )
    if (!response.ok) {
      throw new Error(`Failed to fetch chats: ${response.statusText}`)
    }

    const chats: Array<ChatResponse> = await response.json()
    return chats.map(
      (chat) =>
        new Chat({
          id: chat.id as ChatId,
          name: chat.name,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
        }),
    )
  },

  async createChat(workspaceId: WorkspaceId, name?: string): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workspaceId, name }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create chat: ${response.statusText}`)
    }

    const chat: ChatResponse = await response.json()
    return new Chat({
      id: chat.id as ChatId,
      name: chat.name,
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
    })
  },

  async getChat(workspaceId: WorkspaceId, chatId: ChatId): Promise<Chat> {
    // Get from the chats list since we don't have individual chat endpoint
    const chats = await this.getChats(workspaceId)
    const chat = chats.find((c) => c.id === chatId)
    if (!chat) {
      throw new Error(
        `Chat with id ${chatId} not found in workspace ${workspaceId}`,
      )
    }
    return chat
  },

  async getMessages(
    workspaceId: WorkspaceId,
    chatId: ChatId,
  ): Promise<Array<Message>> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`)
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`)
    }

    const messages: Array<MessageResponse> = await response.json()
    return messages.map(
      (msg) =>
        new Message({
          id: msg.id as MessageId,
          content: msg.content,
          role: msg.role === 0 ? MessageRole.USER : MessageRole.ASSISTANT,
          createdAt: new Date(msg.createdAt),
        }),
    )
  },

  async deleteChat(workspaceId: WorkspaceId, chatId: ChatId): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/chats/${chatId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete chat: ${response.statusText}`)
    }
  },

  async streamMessage(
    workspaceId: WorkspaceId,
    chatId: ChatId,
    content: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<Message> {
    const assistantMessageId = `msg_${Date.now()}` as MessageId

    try {
      const response = await fetch(`${API_BASE_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
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

          const chunk = decoder.decode(value, { stream: true })
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
    detail: (workspaceId: WorkspaceId, id: ChatId) => [
      ...queryKeys.details(),
      workspaceId,
      id,
    ],
    messages: () => [...queryKeys.all, 'messages'],
    messagesList: (workspaceId: WorkspaceId, chatId: ChatId) => [
      ...queryKeys.messages(),
      workspaceId,
      chatId,
    ],
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
    UseMutationOptions<
      Chat,
      Error,
      { workspaceId: WorkspaceId; name?: string }
    >,
    'mutationFn'
  >

  export type DeleteChatMutationOptions = Omit<
    UseMutationOptions<
      void,
      Error,
      { workspaceId: WorkspaceId; chatId: ChatId }
    >,
    'mutationFn'
  >

  export type StreamMessageMutationOptions = Omit<
    UseMutationOptions<
      Message,
      Error,
      {
        workspaceId: WorkspaceId
        chatId: ChatId
        content: string
        onChunk: (chunk: string) => void
      }
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

  export const useChat = (
    workspaceId: WorkspaceId,
    chatId: ChatId,
    options?: ChatQueryOptions,
  ) => {
    return useQuery({
      queryKey: queryKeys.detail(workspaceId, chatId),
      queryFn: () => chatApi.getChat(workspaceId, chatId),
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
        name?: string
      }) => chatApi.createChat(workspaceId, name),
      onSuccess: (newChat, { workspaceId }) => {
        // Update the chats list cache for this workspace
        queryClient.setQueryData<Array<Chat>>(
          queryKeys.list(workspaceId),
          (oldChats = []) => [...oldChats, newChat],
        )

        // Set the individual chat cache
        queryClient.setQueryData(
          queryKeys.detail(workspaceId, newChat.id),
          newChat,
        )

        // Initialize empty messages for the new chat
        queryClient.setQueryData(
          queryKeys.messagesList(workspaceId, newChat.id),
          [],
        )

        // Invalidate to refetch
        queryClient.invalidateQueries({
          queryKey: queryKeys.list(workspaceId),
        })
      },
      ...options,
    })
  }

  export const useDeleteChat = (options?: DeleteChatMutationOptions) => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: ({
        workspaceId,
        chatId,
      }: {
        workspaceId: WorkspaceId
        chatId: ChatId
      }) => chatApi.deleteChat(workspaceId, chatId),
      onSuccess: (_, { workspaceId, chatId }) => {
        // Remove from chats list cache
        queryClient.setQueryData<Array<Chat>>(
          queryKeys.list(workspaceId),
          (oldChats = []) => oldChats.filter((chat) => chat.id !== chatId),
        )

        // Remove individual chat cache
        queryClient.removeQueries({
          queryKey: queryKeys.detail(workspaceId, chatId),
        })

        // Remove messages cache
        queryClient.removeQueries({
          queryKey: queryKeys.messagesList(workspaceId, chatId),
        })
      },
      ...options,
    })
  }

  // Message Hooks
  export const useMessages = (
    workspaceId: WorkspaceId,
    chatId: ChatId,
    options?: MessagesQueryOptions,
  ) => {
    return useQuery({
      queryKey: queryKeys.messagesList(workspaceId, chatId),
      queryFn: () => chatApi.getMessages(workspaceId, chatId),
      staleTime: 1 * 60 * 1000, // 1 minute
      ...options,
    })
  }

  export const useStreamMessage = (options?: StreamMessageMutationOptions) => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({ workspaceId, chatId, content, onChunk }) => {
        // Create user message immediately
        const userMessage = new Message({
          id: `msg_${Date.now()}` as MessageId,
          content,
          role: MessageRole.USER,
          createdAt: new Date(),
        })

        // Add user message to cache
        queryClient.setQueryData<Array<Message>>(
          queryKeys.messagesList(workspaceId, chatId),
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
          queryKeys.messagesList(workspaceId, chatId),
          (oldMessages = []) => [...oldMessages, initialAssistantMessage],
        )

        // Stream response and update incrementally
        const finalMessage = await chatApi.streamMessage(
          workspaceId,
          chatId,
          content,
          (chunk) => {
            // Update assistant message with accumulated content
            queryClient.setQueryData<Array<Message>>(
              queryKeys.messagesList(workspaceId, chatId),
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
      onSuccess: (_, { workspaceId, chatId }) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.detail(workspaceId, chatId),
        })
        queryClient.invalidateQueries({
          queryKey: queryKeys.list(workspaceId),
        })
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
        queryKeys.detail(workspaceId, chatId),
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
      query: useChat(workspaceId, chatId, { enabled: !getChatFromCache() }),
    }
  }

  // Message utilities
  export const useAddMessage = () => {
    const queryClient = useQueryClient()

    return (workspaceId: WorkspaceId, chatId: ChatId, message: Message) => {
      queryClient.setQueryData<Array<Message>>(
        queryKeys.messagesList(workspaceId, chatId),
        (oldMessages = []) => [...oldMessages, message],
      )
    }
  }

  export const useUpdateMessage = () => {
    const queryClient = useQueryClient()

    return (
      workspaceId: WorkspaceId,
      chatId: ChatId,
      messageId: MessageId,
      content: string,
    ) => {
      queryClient.setQueryData<Array<Message>>(
        queryKeys.messagesList(workspaceId, chatId),
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

    return (workspaceId: WorkspaceId, chatId: ChatId) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.detail(workspaceId, chatId),
        queryFn: () => chatApi.getChat(workspaceId, chatId),
        staleTime: 5 * 60 * 1000,
      })
    }
  }

  export const usePrefetchMessages = () => {
    const queryClient = useQueryClient()

    return (workspaceId: WorkspaceId, chatId: ChatId) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.messagesList(workspaceId, chatId),
        queryFn: () => chatApi.getMessages(workspaceId, chatId),
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
      invalidateChat: (workspaceId: WorkspaceId, chatId: ChatId) =>
        queryClient.invalidateQueries({
          queryKey: queryKeys.detail(workspaceId, chatId),
        }),
      invalidateMessages: (workspaceId: WorkspaceId, chatId: ChatId) =>
        queryClient.invalidateQueries({
          queryKey: queryKeys.messagesList(workspaceId, chatId),
        }),
    }
  }
}
