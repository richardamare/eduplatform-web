import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React from 'react'
import { constVoid, constant } from 'effect/Function'
import * as Effect from 'effect/Effect'
import * as HttpClient from '@effect/platform/HttpClient'
import * as Stream from 'effect/Stream'
import * as Schema from 'effect/Schema'
import * as Either from 'effect/Either'
import * as Option from 'effect/Option'
import * as Schedule from 'effect/Schedule'
import * as Fiber from 'effect/Fiber'
import { getMessagesByChatId } from '@/lib/mock-data'
import { Message, MessageId, MessageRole } from '@/types/message'
import { runtime } from '@/lib/runtime'

export interface UseChatOptions {
  /** Chat ID to identify the conversation */
  id?: string
  /** Initial messages to populate the chat */
  initialMessages?: Array<Message>
  /** Initial input value */
  initialInput?: string
  /** API endpoint for chat requests */
  api?: string
  /** Additional headers for requests */
  headers?: Record<string, string>
  /** Additional body data for requests */
  body?: object
  /** Called when a response is received */
  onResponse?: (response: Response) => void | Promise<void>
  /** Called when streaming finishes */
  onFinish?: (message: Message) => void
  /** Called on error */
  onError?: (error: Error) => void
  /** Keep last message on error */
  keepLastMessageOnError?: boolean
}

export interface CreateMessage {
  id?: string
  content: string
  role: MessageRole
  createdAt?: Date
}

export interface ChatRequestOptions {
  /** Additional headers for this request */
  headers?: Record<string, string>
  /** Additional body data for this request */
  body?: object
  /** Additional data to send */
  data?: any
}

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

export interface UseChatHelpers {
  /** Current messages in the chat */
  messages: Array<Message>
  /** Chat ID */
  id: string
  /** The error object of the API request */
  error: undefined | Error
  /** Current status of the chat */
  status: ChatStatus
  /** Whether the API request is in progress */
  isLoading: boolean

  /**
   * Append a user message to the chat list. This triggers the API call to fetch
   * the assistant's response.
   */
  append: (
    message: Message | CreateMessage,
    options?: ChatRequestOptions,
  ) => Promise<string | null | undefined>

  /**
   * Reload the last AI chat response for the given chat history.
   */
  reload: (options?: ChatRequestOptions) => Promise<string | null | undefined>

  /** Abort the current request immediately */
  stop: () => void

  /**
   * Update the messages state locally
   */
  setMessages: (
    messages: Array<Message> | ((messages: Array<Message>) => Array<Message>),
  ) => void

  /** The current value of the input */
  input: string
  /** setState-powered method to update the input value */
  setInput: React.Dispatch<React.SetStateAction<string>>
  /** onChange handler to control the input value */
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  /** Form submission handler to automatically reset input and append a user message */
  handleSubmit: (
    event?: { preventDefault?: () => void },
    options?: ChatRequestOptions,
  ) => void
}

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function useChat({
  id,
  initialMessages = [],
  initialInput = '',
  api = 'http://localhost:5131/chat',
  headers,
  body,
  onResponse,
  onFinish,
  onError,
  keepLastMessageOnError = true,
}: UseChatOptions = {}): UseChatHelpers {
  const queryClient = useQueryClient()
  const [chatId] = React.useState(() => id ?? generateId())
  const [status, setStatus] = React.useState<ChatStatus>('ready')
  const [input, setInput] = React.useState(initialInput)
  const abortControllerRef = React.useRef<AbortController | null>(null)
  const hasRun = React.useRef(false)

  // Query for messages
  const {
    data: messages = initialMessages,
    isLoading: isLoadingMessages,
    error: queryError,
  } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => {
      if (!chatId || initialMessages.length > 0) return initialMessages
      return getMessagesByChatId(chatId)
    },
    enabled: !!chatId,
  })

  const [error, setError] = React.useState<Error | undefined>(
    queryError || undefined,
  )

  React.useEffect(() => {
    setError(queryError || undefined)
  }, [queryError])

  const setMessages = React.useCallback(
    (
      newMessages:
        | Array<Message>
        | ((messages: Array<Message>) => Array<Message>),
    ) => {
      queryClient.setQueryData(
        ['messages', chatId],
        (oldMessages: Array<Message> = []) => {
          if (typeof newMessages === 'function') {
            return newMessages(oldMessages)
          }
          return newMessages
        },
      )
    },
    [queryClient, chatId],
  )

  const streamResponse = React.useCallback(
    async (userMessage: Message, options: ChatRequestOptions = {}) => {
      setStatus('submitted')
      setError(undefined)

      // Create empty assistant message immediately
      const assistantMessageId = MessageId.make(generateId())
      const assistantMessage = new Message({
        id: assistantMessageId,
        content: '',
        role: MessageRole.ASSISTANT,
        createdAt: new Date(),
      })

      // Add empty assistant message to cache
      setMessages((oldMessages) => [...oldMessages, assistantMessage])

      try {
        setStatus('streaming')

        // Create abort controller for this request
        abortControllerRef.current = new AbortController()

        const response = await fetch(api, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
            ...options.headers,
          },
          body: JSON.stringify({
            message: userMessage.content,
            ...body,
            ...options.body,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (onResponse) {
          await onResponse(response)
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No reader available')
        }

        const decoder = new TextDecoder()
        let accumulatedContent = ''

        let reading = true
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (reading) {
          const { done, value } = await reader.read()

          if (done) {
            reading = false
            break
          }

          // Decode the chunk as raw text (not SSE format)
          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk

          // Update the assistant message with accumulated content
          setMessages((oldMessages) =>
            oldMessages.map((msg) =>
              msg.id === assistantMessageId
                ? new Message({
                    ...msg,
                    content: accumulatedContent,
                  })
                : msg,
            ),
          )
        }

        reader.releaseLock()

        const finalMessage = new Message({
          id: assistantMessageId,
          content: accumulatedContent,
          role: MessageRole.ASSISTANT,
          createdAt: new Date(),
        })

        if (onFinish) {
          onFinish(finalMessage)
        }

        setStatus('ready')
        return finalMessage.id
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Stream aborted')
          setStatus('ready')
          return null
        }

        console.error('Streaming error:', error)

        const errorMessage =
          error instanceof Error ? error.message : 'An error occurred'

        if (!keepLastMessageOnError) {
          // Remove the failed assistant message
          setMessages((oldMessages) =>
            oldMessages.filter((msg) => msg.id !== assistantMessageId),
          )
        } else {
          // Update the assistant message with error
          setMessages((oldMessages) =>
            oldMessages.map((msg) =>
              msg.id === assistantMessageId
                ? new Message({
                    ...msg,
                    content:
                      'Sorry, an error occurred while generating the response.',
                  })
                : msg,
            ),
          )
        }

        const err = error instanceof Error ? error : new Error(errorMessage)
        setError(err)

        if (onError) {
          onError(err)
        }

        setStatus('error')
        return null
      } finally {
        abortControllerRef.current = null
      }
    },
    [
      api,
      headers,
      body,
      chatId,
      onResponse,
      onFinish,
      onError,
      keepLastMessageOnError,
      setMessages,
    ],
  )

  const append = React.useCallback(
    async (
      message: Message | CreateMessage,
      options: ChatRequestOptions = {},
    ) => {
      const newMessage =
        message instanceof Message
          ? message
          : new Message({
              id: MessageId.make(message.id ?? generateId()),
              content: message.content,
              role: message.role,
              createdAt: message.createdAt ?? new Date(),
            })

      // Add user message to cache
      setMessages((oldMessages) => [...oldMessages, newMessage])

      // If this is a user message, start streaming response
      if (newMessage.role === MessageRole.USER) {
        return streamResponse(newMessage, options)
      }

      return newMessage.id
    },
    [streamResponse, setMessages],
  )

  const reload = React.useCallback(
    async (options: ChatRequestOptions = {}) => {
      if (messages.length === 0) {
        return null
      }

      // Remove last assistant message and retry last user message
      const lastMessage = messages[messages.length - 1]
      const isLastAssistant = lastMessage.role === MessageRole.ASSISTANT

      if (isLastAssistant) {
        setMessages((oldMessages) => oldMessages.slice(0, -1))
      }

      const lastUserMessage = messages
        .slice()
        .reverse()
        .find((msg) => msg.role === MessageRole.USER)

      if (lastUserMessage) {
        return streamResponse(lastUserMessage, options)
      }

      return null
    },
    [messages, streamResponse, setMessages],
  )

  const stop = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setStatus('ready')
    }
  }, [])

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value)
    },
    [],
  )

  const handleSubmit = React.useCallback(
    async (
      event?: { preventDefault?: () => void },
      options: ChatRequestOptions = {},
    ) => {
      event?.preventDefault?.()

      if (!input.trim()) return

      const userMessage: CreateMessage = {
        id: generateId(),
        content: input,
        role: MessageRole.USER,
        createdAt: new Date(),
      }

      setInput('')

      return append(userMessage, options)
    },
    [input, append],
  )

  return {
    messages,
    id: chatId,
    error,
    status,
    isLoading:
      status === 'submitted' || status === 'streaming' || isLoadingMessages,
    append,
    reload,
    stop,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
  }
}
