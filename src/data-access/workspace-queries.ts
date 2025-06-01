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

const API_BASE_URL = 'http://localhost:5131/api'

// API Response types
interface WorkspaceResponse {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface CreateWorkspaceRequest {
  name: string
}

interface UpdateWorkspaceRequest {
  name: string
}

// API functions
const workspaceApi = {
  async getWorkspaces(): Promise<Array<Workspace>> {
    const response = await fetch(`${API_BASE_URL}/workspaces`)
    if (!response.ok) {
      throw new Error(`Failed to fetch workspaces: ${response.statusText}`)
    }

    const workspaces: Array<WorkspaceResponse> = await response.json()
    return workspaces.map(
      (workspace) =>
        new Workspace({
          id: workspace.id as WorkspaceId,
          name: workspace.name,
          createdAt: new Date(workspace.createdAt),
          updatedAt: new Date(workspace.updatedAt),
        }),
    )
  },

  async createWorkspace(payload: CreateWorkspacePayload): Promise<Workspace> {
    const response = await fetch(`${API_BASE_URL}/workspaces`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: payload.name }),
    })

    if (!response.ok) {
      throw new Error(`Failed to create workspace: ${response.statusText}`)
    }

    const workspace: WorkspaceResponse = await response.json()
    return new Workspace({
      id: workspace.id as WorkspaceId,
      name: workspace.name,
      createdAt: new Date(workspace.createdAt),
      updatedAt: new Date(workspace.updatedAt),
    })
  },

  async getWorkspace(id: WorkspaceId): Promise<Workspace> {
    const response = await fetch(`${API_BASE_URL}/workspaces/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch workspace: ${response.statusText}`)
    }

    const workspace: WorkspaceResponse = await response.json()
    return new Workspace({
      id: workspace.id as WorkspaceId,
      name: workspace.name,
      createdAt: new Date(workspace.createdAt),
      updatedAt: new Date(workspace.updatedAt),
    })
  },

  async updateWorkspace(id: WorkspaceId, name: string): Promise<Workspace> {
    const response = await fetch(`${API_BASE_URL}/workspaces/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update workspace: ${response.statusText}`)
    }

    const workspace: WorkspaceResponse = await response.json()
    return new Workspace({
      id: workspace.id as WorkspaceId,
      name: workspace.name,
      createdAt: new Date(workspace.createdAt),
      updatedAt: new Date(workspace.updatedAt),
    })
  },

  async deleteWorkspace(id: WorkspaceId): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/workspaces/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete workspace: ${response.statusText}`)
    }
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

  export type UpdateWorkspaceMutationOptions = Omit<
    UseMutationOptions<Workspace, Error, { id: WorkspaceId; name: string }>,
    'mutationFn'
  >

  export type DeleteWorkspaceMutationOptions = Omit<
    UseMutationOptions<void, Error, WorkspaceId>,
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

        // Invalidate to refetch
        queryClient.invalidateQueries({
          queryKey: queryKeys.lists(),
        })

        queryClient.invalidateQueries({
          queryKey: queryKeys.all,
        })
      },
      ...options,
    })
  }

  export const useUpdateWorkspace = (
    options?: UpdateWorkspaceMutationOptions,
  ) => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: ({ id, name }: { id: WorkspaceId; name: string }) =>
        workspaceApi.updateWorkspace(id, name),
      onSuccess: (updatedWorkspace) => {
        // Update the workspaces list cache
        queryClient.setQueryData<Array<Workspace>>(
          queryKeys.lists(),
          (oldWorkspaces = []) =>
            oldWorkspaces.map((workspace) =>
              workspace.id === updatedWorkspace.id
                ? updatedWorkspace
                : workspace,
            ),
        )

        // Update the individual workspace cache
        queryClient.setQueryData(
          queryKeys.detail(updatedWorkspace.id),
          updatedWorkspace,
        )

        // Invalidate to refetch
        queryClient.invalidateQueries({
          queryKey: queryKeys.lists(),
        })
      },
      ...options,
    })
  }

  export const useDeleteWorkspace = (
    options?: DeleteWorkspaceMutationOptions,
  ) => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: (id: WorkspaceId) => workspaceApi.deleteWorkspace(id),
      onSuccess: (_, deletedId) => {
        // Remove from workspaces list cache
        queryClient.setQueryData<Array<Workspace>>(
          queryKeys.lists(),
          (oldWorkspaces = []) =>
            oldWorkspaces.filter((workspace) => workspace.id !== deletedId),
        )

        // Remove individual workspace cache
        queryClient.removeQueries({
          queryKey: queryKeys.detail(deletedId),
        })

        // Invalidate to refetch
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

  // Get default workspace
  export const useDefaultWorkspace = () => {
    const { data: workspaces } = useWorkspaces()
    return workspaces?.[0] || null
  }
}
