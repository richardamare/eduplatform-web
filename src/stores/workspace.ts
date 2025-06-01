import type { StateCreator } from 'zustand'
import {
  type CreateWorkspacePayload,
  Workspace,
  type WorkspaceId,
} from '@/types/workspace'

export interface WorkspaceState {
  // Data
  workspaces: Record<WorkspaceId, Workspace>

  // Loading states
  loading: {
    workspaces: boolean
    creating: boolean
  }

  // Error states
  errors: {
    workspaces: string | null
    creating: string | null
  }

  // Actions
  loadWorkspaces: () => Promise<void>
  createWorkspace: (payload: CreateWorkspacePayload) => Promise<Workspace>
  getWorkspace: (id: WorkspaceId) => Workspace | null
  clearWorkspaceErrors: () => void
}

export const createWorkspaceSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  WorkspaceState
> = (set, get) => {
  return {
    // Initial state
    workspaces: {},
    loading: {
      workspaces: false,
      creating: false,
    },
    errors: {
      workspaces: null,
      creating: null,
    },

    // Actions
    loadWorkspaces: async () => {
      set((state) => ({
        ...state,
        loading: { ...state.loading, workspaces: true },
        errors: { ...state.errors, workspaces: null },
      }))

      try {
        // Simulate API call - replace with actual API
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Mock data - replace with actual API call
        const mockWorkspaces = [
          new Workspace({
            id: 'ws_1' as WorkspaceId,
            name: 'My First Workspace',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          new Workspace({
            id: 'ws_2' as WorkspaceId,
            name: 'Learning Hub',
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ]

        const workspacesRecord: Record<WorkspaceId, Workspace> = {}
        mockWorkspaces.forEach((workspace) => {
          workspacesRecord[workspace.id] = workspace
        })

        set((state) => ({
          ...state,
          workspaces: workspacesRecord,
          loading: { ...state.loading, workspaces: false },
        }))
      } catch (error) {
        set((state) => ({
          ...state,
          loading: { ...state.loading, workspaces: false },
          errors: {
            ...state.errors,
            workspaces:
              error instanceof Error
                ? error.message
                : 'Failed to load workspaces',
          },
        }))
      }
    },

    createWorkspace: async (payload) => {
      set((state) => ({
        ...state,
        loading: { ...state.loading, creating: true },
        errors: { ...state.errors, creating: null },
      }))

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const newWorkspace = new Workspace({
          id: `ws_${Date.now()}` as WorkspaceId,
          name: payload.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        set((state) => ({
          ...state,
          workspaces: {
            ...state.workspaces,
            [newWorkspace.id]: newWorkspace,
          },
          loading: { ...state.loading, creating: false },
        }))

        return newWorkspace
      } catch (error) {
        set((state) => ({
          ...state,
          loading: { ...state.loading, creating: false },
          errors: {
            ...state.errors,
            creating:
              error instanceof Error
                ? error.message
                : 'Failed to create workspace',
          },
        }))
        throw error
      }
    },

    getWorkspace: (id) => {
      return get().workspaces[id] || null
    },

    clearWorkspaceErrors: () => {
      set((state) => ({
        ...state,
        errors: {
          workspaces: null,
          creating: null,
        },
      }))
    },
  }
}
