import type { StateCreator } from 'zustand'
import { Chat, type ChatId } from '@/types/chat'
import { type WorkspaceId } from '@/types/workspace'

export interface ChatState {
  // Data
  chats: Record<WorkspaceId, Array<Chat>>

  // Loading states
  loading: {
    chats: Record<WorkspaceId, boolean>
    creating: Record<WorkspaceId, boolean>
  }

  // Error states
  errors: {
    chats: Record<WorkspaceId, string | null>
    creating: Record<WorkspaceId, string | null>
  }

  // Actions
  loadChats: (workspaceId: WorkspaceId) => Promise<void>
  createChat: (workspaceId: WorkspaceId, name: string) => Promise<Chat>
  getChat: (workspaceId: WorkspaceId, chatId: ChatId) => Chat | null
  getChatsByWorkspace: (workspaceId: WorkspaceId) => Array<Chat>
  clearChatErrors: (workspaceId: WorkspaceId) => void
}

export const createChatSlice: StateCreator<ChatState, [], [], ChatState> = (
  set,
  get,
) => {
  return {
    // Initial state
    chats: {},
    loading: {
      chats: {},
      creating: {},
    },
    errors: {
      chats: {},
      creating: {},
    },

    // Actions
    loadChats: async (workspaceId) => {
      set((state) => ({
        ...state,
        loading: {
          ...state.loading,
          chats: { ...state.loading.chats, [workspaceId]: true },
        },
        errors: {
          ...state.errors,
          chats: { ...state.errors.chats, [workspaceId]: null },
        },
      }))

      try {
        // Simulate API call - replace with actual API
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Mock data - replace with actual API call
        const mockChats = [
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

        set((state) => ({
          ...state,
          chats: {
            ...state.chats,
            [workspaceId]: mockChats,
          },
          loading: {
            ...state.loading,
            chats: { ...state.loading.chats, [workspaceId]: false },
          },
        }))
      } catch (error) {
        set((state) => ({
          ...state,
          loading: {
            ...state.loading,
            chats: { ...state.loading.chats, [workspaceId]: false },
          },
          errors: {
            ...state.errors,
            chats: {
              ...state.errors.chats,
              [workspaceId]:
                error instanceof Error ? error.message : 'Failed to load chats',
            },
          },
        }))
      }
    },

    createChat: async (workspaceId, name) => {
      set((state) => ({
        ...state,
        loading: {
          ...state.loading,
          creating: { ...state.loading.creating, [workspaceId]: true },
        },
        errors: {
          ...state.errors,
          creating: { ...state.errors.creating, [workspaceId]: null },
        },
      }))

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        const newChat = new Chat({
          id: `chat_${workspaceId}_${Date.now()}` as ChatId,
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        set((state) => ({
          ...state,
          chats: {
            ...state.chats,
            [workspaceId]: [...(state.chats[workspaceId] || []), newChat],
          },
          loading: {
            ...state.loading,
            creating: { ...state.loading.creating, [workspaceId]: false },
          },
        }))

        return newChat
      } catch (error) {
        set((state) => ({
          ...state,
          loading: {
            ...state.loading,
            creating: { ...state.loading.creating, [workspaceId]: false },
          },
          errors: {
            ...state.errors,
            creating: {
              ...state.errors.creating,
              [workspaceId]:
                error instanceof Error
                  ? error.message
                  : 'Failed to create chat',
            },
          },
        }))
        throw error
      }
    },

    getChat: (workspaceId, chatId) => {
      const workspaceChats = get().chats[workspaceId] || []
      return workspaceChats.find((chat) => chat.id === chatId) || null
    },

    getChatsByWorkspace: (workspaceId) => {
      return get().chats[workspaceId] || []
    },

    clearChatErrors: (workspaceId) => {
      set((state) => ({
        ...state,
        errors: {
          ...state.errors,
          chats: { ...state.errors.chats, [workspaceId]: null },
          creating: { ...state.errors.creating, [workspaceId]: null },
        },
      }))
    },
  }
}
