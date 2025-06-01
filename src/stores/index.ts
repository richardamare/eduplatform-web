import { create } from 'zustand'
import { type ModalState, createModalSlice } from '@/stores/modal'
import { type WorkspaceState, createWorkspaceSlice } from '@/stores/workspace'
import { type ChatState, createChatSlice } from '@/stores/chat'
import { type MessageState, createMessageSlice } from '@/stores/message'

export const useModalStore = create<ModalState>()(createModalSlice)
export const useWorkspaceStore = create<WorkspaceState>()(createWorkspaceSlice)
export const useChatStore = create<ChatState>()(createChatSlice)
export const useMessageStore = create<MessageState>()(createMessageSlice)

// Combined app state for convenience
export type AppState = MessageState
export const useAppState = useMessageStore
