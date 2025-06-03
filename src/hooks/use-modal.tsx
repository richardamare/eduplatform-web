import { create } from 'zustand'

export enum MODAL_TYPE {
  CREATE_WORKSPACE = 'CREATE_WORKSPACE',
  RENAME_CHAT = 'RENAME_CHAT',
  GENERATE_FLASHCARDS = 'GENERATE_FLASHCARDS',
}

interface CreateWorkspaceModalPayload {
  type: MODAL_TYPE.CREATE_WORKSPACE
  props: {}
}

interface RenameChatModalPayload {
  type: MODAL_TYPE.RENAME_CHAT
  props: {
    chatId: string
  }
}

interface GenerateFlashcardsModalPayload {
  type: MODAL_TYPE.GENERATE_FLASHCARDS
  props: {
    workspaceId: string
  }
}

export type OpenModalPayload =
  | CreateWorkspaceModalPayload
  | RenameChatModalPayload
  | GenerateFlashcardsModalPayload

type ModalState = {
  isOpen: boolean
} & OpenModalPayload

interface UseModalState {
  modals: Record<string, ModalState>
  open: (payload: OpenModalPayload) => string
  get: (id: string) => ModalState
  close: (id: string) => void
}

export const useModal = create<UseModalState>()((set, get) => ({
  modals: {},
  close: (id) => {
    set((state) => ({
      modals: {
        ...state.modals,
        [id]: { ...state.modals[id], isOpen: false },
      },
    }))
  },
  get: (id) => {
    return get().modals[id]
  },
  open: (payload) => {
    const id = crypto.randomUUID()

    set((state) => {
      return {
        modals: {
          ...state.modals,
          [id]: {
            isOpen: true,
            ...payload,
          },
        },
      }
    })
    return id
  },
}))
