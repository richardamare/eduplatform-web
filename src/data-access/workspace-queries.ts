import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import {
  type CreateWorkspacePayload,
  Workspace,
  type WorkspaceId,
} from '@/types/workspace'

// API functions (replace with actual API calls)
const workspaceApi = {
  async getWorkspaces(): Promise<Array<Workspace>> {
    // Simulate API call - replace with actual API
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock data - replace with actual API call
    return [
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
  },

  async createWorkspace(payload: CreateWorkspacePayload): Promise<Workspace> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return new Workspace({
      id: `ws_${Date.now()}` as WorkspaceId,
      name: payload.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  },

  async getWorkspace(id: WorkspaceId): Promise<Workspace> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock implementation - replace with actual API
    const workspaces = await this.getWorkspaces()
    const workspace = workspaces.find((w) => w.id === id)
    if (!workspace) {
      throw new Error(`Workspace with id ${id} not found`)
    }
    return workspace
  },
}

export namespace WorkspaceQueries {
  // Query Keys
  export const queryKeys = {
    all: ['workspaces'],
    lists: () => [...queryKeys.all, 'list'],
    list: (filters?: Record<string, any>) => [...queryKeys.lists(), filters],
    details: () => [...queryKeys.all, 'detail'],
    detail: (id: WorkspaceId) => [...queryKeys.details(), id],
  }

  // Types
  export type WorkspacesQueryOptions = Omit<
    UseQueryOptions<Array<Workspace>, Error, Array<Workspace>>,
    'queryKey' | 'queryFn'
  >

  export type WorkspaceQueryOptions = Omit<
    UseQueryOptions<Workspace, Error, Workspace>,
    'queryKey' | 'queryFn'
  >

  export type CreateWorkspaceMutationOptions = Omit<
    UseMutationOptions<Workspace, Error, CreateWorkspacePayload>,
    'mutationFn'
  >

  // Hooks
  export const useWorkspaces = (options?: WorkspacesQueryOptions) => {
    return useQuery({
      queryKey: queryKeys.lists(),
      queryFn: workspaceApi.getWorkspaces,
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    })
  }

  export const useWorkspace = (
    id: WorkspaceId,
    options?: WorkspaceQueryOptions,
  ) => {
    const queryClient = useQueryClient()

    return useQuery({
      queryKey: queryKeys.detail(id),
      queryFn: () => workspaceApi.getWorkspace(id),
      staleTime: 5 * 60 * 1000,
      initialData: () => {
        // Try to get from cache first
        const workspaces = queryClient.getQueryData<Array<Workspace>>(
          queryKeys.lists(),
        )
        return workspaces?.find((workspace) => workspace.id === id)
      },
      ...options,
    })
  }

  export const useCreateWorkspace = (
    options?: CreateWorkspaceMutationOptions,
  ) => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: workspaceApi.createWorkspace,
      onSuccess: (newWorkspace) => {
        // Update the workspaces list cache
        queryClient.setQueryData<Array<Workspace>>(
          queryKeys.lists(),
          (oldWorkspaces = []) => [...oldWorkspaces, newWorkspace],
        )

        // Set the individual workspace cache
        queryClient.setQueryData(
          queryKeys.detail(newWorkspace.id),
          newWorkspace,
        )

        // Optionally invalidate to refetch
        queryClient.invalidateQueries({
          queryKey: queryKeys.lists(),
        })
      },
      ...options,
    })
  }

  // Utility functions
  export const useWorkspaceById = (id: WorkspaceId) => {
    const queryClient = useQueryClient()

    const getWorkspaceFromCache = (): Workspace | null => {
      // First try individual cache
      const individualWorkspace = queryClient.getQueryData<Workspace>(
        queryKeys.detail(id),
      )
      if (individualWorkspace) return individualWorkspace

      // Then try from list cache
      const workspaces = queryClient.getQueryData<Array<Workspace>>(
        queryKeys.lists(),
      )
      return workspaces?.find((workspace) => workspace.id === id) || null
    }

    return {
      workspace: getWorkspaceFromCache(),
      query: useWorkspace(id, { enabled: !getWorkspaceFromCache() }),
    }
  }

  // Prefetch utilities
  export const usePrefetchWorkspace = () => {
    const queryClient = useQueryClient()

    return (id: WorkspaceId) => {
      queryClient.prefetchQuery({
        queryKey: queryKeys.detail(id),
        queryFn: () => workspaceApi.getWorkspace(id),
        staleTime: 5 * 60 * 1000,
      })
    }
  }

  // Cache management
  export const useInvalidateWorkspaces = () => {
    const queryClient = useQueryClient()

    return {
      invalidateAll: () =>
        queryClient.invalidateQueries({ queryKey: queryKeys.all }),
      invalidateList: () =>
        queryClient.invalidateQueries({ queryKey: queryKeys.lists() }),
      invalidateWorkspace: (id: WorkspaceId) =>
        queryClient.invalidateQueries({ queryKey: queryKeys.detail(id) }),
    }
  }
}
