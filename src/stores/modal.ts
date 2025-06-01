import type { StateCreator } from 'zustand'
import type { OpenModalPayload } from '@/types/modal'

type DialogState = {
  isOpen: boolean
} & OpenModalPayload

export interface ModalState {
  modals: Record<string, DialogState>
  open: (payload: OpenModalPayload) => string
  get: (id: string) => DialogState
  close: (id: string) => void
}

export const createModalSlice: StateCreator<ModalState, [], [], ModalState> = (
  set,
  get,
) => {
  return {
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
  }
}
