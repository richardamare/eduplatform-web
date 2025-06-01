import { create } from 'zustand'
import { type ModalState, createModalSlice } from '@/stores/modal'

export const useModalStore = create<ModalState>()(createModalSlice)
