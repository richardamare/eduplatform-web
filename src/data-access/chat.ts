import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { Effect, Schema } from 'effect'
import {
  HttpBody,
  HttpClientRequest,
  HttpClientResponse,
} from '@effect/platform'
import { httpClient } from './api'
import { Chat, ChatDto, ChatId } from '@/types/chat'
import {
  Message,
  MessageDto,
  type MessageId,
  MessageRole,
} from '@/types/message'
import { type WorkspaceId } from '@/types/workspace'
import { SERVER_URL } from '@/lib/constants'
import { useRuntime } from '@/hooks/use-runtime'

// API functions
const chatApi = {
  getChats: Effect.fn(function* (workspaceId: WorkspaceId) {
    const http = yield* httpClient
    return yield* http.get(`/workspaces/${workspaceId}/chats`).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(Schema.Array(ChatDto), {
          errors: 'all',
        }),
      ),
      Effect.map((chats) =>
        chats.map(
          (chat) =>
            new Chat({
              id: ChatId.make(chat.id),
              name: chat.name,
              createdAt: new Date(chat.created_at),
              updatedAt: new Date(chat.updated_at),
            }),
        ),
      ),
      Effect.tapError(Effect.logError),
    )
  }),

  getChat: Effect.fn(function* (workspaceId: WorkspaceId, chatId: ChatId) {
    const http = yield* httpClient
    return yield* http.get(`/chats/${chatId}`).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(ChatDto, {
          errors: 'all',
        }),
      ),
      Effect.map(
        (chat) =>
          new Chat({
            id: ChatId.make(chat.id),
            name: chat.name,
            createdAt: new Date(chat.created_at),
            updatedAt: new Date(chat.updated_at),
          }),
      ),
      Effect.tapError(Effect.logError),
    )
  }),

  createChat: Effect.fn(function* (workspaceId: WorkspaceId) {
    const http = yield* httpClient

    const request = HttpClientRequest.post(`/chats`).pipe(
      HttpClientRequest.setBody(yield* HttpBody.json({ workspaceId })),
    )

    return yield* http.execute(request).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(ChatDto, {
          errors: 'all',
        }),
      ),
      Effect.map(
        (chat) =>
          new Chat({
            id: ChatId.make(chat.id),
            name: chat.name,
            createdAt: new Date(chat.created_at),
            updatedAt: new Date(chat.updated_at),
          }),
      ),
      Effect.tapError(Effect.logError),
    )
  }),

  getChatMessages: Effect.fn(function* (
    workspaceId: WorkspaceId,
    chatId: ChatId,
  ) {
    const http = yield* httpClient
    return yield* http.get(`/chats/${chatId}/messages`).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(
          Schema.Array(Message.pipe(Schema.omit('_tag'))),
          {
            errors: 'all',
          },
        ),
      ),
      Effect.map((messages) => {
        console.log('messages', messages)
        return messages.map(
          (message) =>
            new Message({
              id: message.id,
              content: message.content,
              role:
                message.role === 'user'
                  ? MessageRole.USER
                  : MessageRole.ASSISTANT,
              createdAt: new Date(message.createdAt),
            }),
        )
      }),
      Effect.tapError(Effect.logError),
    )
  }),

  async getMessages(chatId: ChatId): Promise<Array<Message>> {
    const response = await fetch(`${SERVER_URL}/chats/${chatId}/messages`)
    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`)
    }

    const messages: Array<MessageDto> = await response.json()
    return messages.map(
      (msg) =>
        new Message({
          id: msg.id as MessageId,
          content: msg.content,
          role: msg.role === 'user' ? MessageRole.USER : MessageRole.ASSISTANT,
          createdAt: new Date(msg.createdAt),
        }),
    )
  },

  async streamMessage(
    chatId: ChatId,
    content: string,
    onChunk: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<Message> {
    const assistantMessageId = `msg_${Date.now()}` as MessageId

    try {
      const response = await fetch(`${SERVER_URL}/chats/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content, chatId }),
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
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.content) {
                  accumulatedContent += data.content
                  onChunk(accumulatedContent)
                } else if (data.error) {
                  throw new Error(data.error)
                }
                // data.done is handled by the stream ending
              } catch (e) {
                // Ignore JSON parse errors for incomplete chunks
              }
            }
          }
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
    const runtime = useRuntime()

    return useQuery({
      queryKey: queryKeys.list(workspaceId),
      queryFn: () => chatApi.getChats(workspaceId).pipe(runtime.runPromise),
      staleTime: 2 * 60 * 1000, // 2 minutes
      ...options,
    })
  }

  export const useChat = (
    workspaceId: WorkspaceId,
    chatId: ChatId,
    options?: ChatQueryOptions,
  ) => {
    const runtime = useRuntime()

    return useQuery({
      queryKey: queryKeys.detail(workspaceId, chatId),
      queryFn: () =>
        chatApi.getChat(workspaceId, chatId).pipe(runtime.runPromise),
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }

  export const useCreateChat = (options?: CreateChatMutationOptions) => {
    const queryClient = useQueryClient()
    const runtime = useRuntime()
    return useMutation({
      mutationFn: ({ workspaceId }: { workspaceId: WorkspaceId }) =>
        chatApi.createChat(workspaceId).pipe(runtime.runPromise),
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

  // Message Hooks
  export const useMessages = (
    workspaceId: WorkspaceId,
    chatId: ChatId,
    options?: MessagesQueryOptions,
  ) => {
    return useQuery({
      queryKey: queryKeys.messagesList(workspaceId, chatId),
      queryFn: () => chatApi.getMessages(chatId),
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
