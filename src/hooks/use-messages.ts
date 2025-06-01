import { useCallback, useEffect } from 'react'
import { useMessageStore } from '@/stores'
import { type ChatId } from '@/types/chat'

export const useMessages = (chatId: ChatId) => {
  const messages = useMessageStore((state) => state.getMessages(chatId))
  const loading = useMessageStore(
    (state) => state.loading.messages[chatId] ?? false,
  )
  const streaming = useMessageStore(
    (state) => state.loading.streaming[chatId] ?? false,
  )
  const error = useMessageStore(
    (state) => state.errors.messages[chatId] ?? null,
  )
  const streamingError = useMessageStore(
    (state) => state.errors.streaming[chatId] ?? null,
  )
  const loadMessages = useMessageStore((state) => state.loadMessages)
  const sendMessage = useMessageStore((state) => state.sendMessage)
  const stopStreaming = useMessageStore((state) => state.stopStreaming)
  const clearErrors = useMessageStore((state) => state.clearMessageErrors)

  useEffect(() => {
    if (messages.length === 0 && !loading) {
      loadMessages(chatId)
    }
  }, [messages.length, loading, loadMessages, chatId])

  const handleSendMessage = useCallback(
    (content: string) => sendMessage(chatId, content),
    [sendMessage, chatId],
  )

  const handleStopStreaming = useCallback(
    () => stopStreaming(chatId),
    [stopStreaming, chatId],
  )

  const handleClearErrors = useCallback(
    () => clearErrors(chatId),
    [clearErrors, chatId],
  )

  return {
    messages,
    loading,
    streaming,
    error: error || streamingError,
    isLoading: loading || streaming,
    sendMessage: handleSendMessage,
    stopStreaming: handleStopStreaming,
    clearErrors: handleClearErrors,
    refetch: () => loadMessages(chatId),
  }
}
