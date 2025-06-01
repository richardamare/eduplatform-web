import { useEffect } from 'react'
import { useChatStore } from '@/stores'
import { type WorkspaceId } from '@/types/workspace'
import { type ChatId } from '@/types/chat'

export const useChats = (workspaceId: WorkspaceId) => {
  const chats = useChatStore((state) => state.getChatsByWorkspace(workspaceId))
  const loading = useChatStore(
    (state) => state.loading.chats[workspaceId] ?? false,
  )
  const error = useChatStore((state) => state.errors.chats[workspaceId] ?? null)
  const loadChats = useChatStore((state) => state.loadChats)
  const createChat = useChatStore((state) => state.createChat)
  const clearErrors = useChatStore((state) => state.clearChatErrors)

  useEffect(() => {
    if (chats.length === 0 && !loading) {
      loadChats(workspaceId)
    }
  }, [chats.length, loading, loadChats, workspaceId])

  return {
    chats,
    loading,
    error,
    createChat: (name: string) => createChat(workspaceId, name),
    clearErrors: () => clearErrors(workspaceId),
    refetch: () => loadChats(workspaceId),
  }
}

export const useChat = (workspaceId: WorkspaceId, chatId: ChatId) => {
  const chat = useChatStore((state) => state.getChat(workspaceId, chatId))
  const loading = useChatStore(
    (state) => state.loading.chats[workspaceId] ?? false,
  )
  const error = useChatStore((state) => state.errors.chats[workspaceId] ?? null)
  const loadChats = useChatStore((state) => state.loadChats)

  useEffect(() => {
    if (!chat && !loading) {
      loadChats(workspaceId)
    }
  }, [chat, loading, loadChats, workspaceId])

  return {
    chat,
    loading,
    error,
    refetch: () => loadChats(workspaceId),
  }
}
