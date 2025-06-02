import {
  useMutation,
  type UseMutationOptions,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { Effect, Schema } from 'effect'
import {
  HttpBody,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from '@effect/platform'
import {
  type CreateWorkspacePayload,
  Workspace,
  type WorkspaceId,
} from '@/types/workspace'
import { httpClient } from '@/data-access/api.ts'
import { useRuntime } from '@/hooks/use-runtime.ts'

const workspaceApi = {
  getWorkspaces: Effect.fn(function* () {
    const client = yield* httpClient

    return yield* client.get('/workspaces').pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(
          Schema.Array(Workspace.pipe(Schema.omit('_tag'))),
          {
            errors: 'all',
          },
        ),
      ),
      Effect.map((workspaces) =>
        workspaces.map(
          (workspace) =>
            new Workspace({
              id: workspace.id,
              name: workspace.name,
              createdAt: new Date(workspace.createdAt),
              updatedAt: new Date(workspace.updatedAt),
            }),
        ),
      ),
      Effect.tapError(Effect.logError),
    )
  }),

  createWorkspace: Effect.fn(function* (payload: CreateWorkspacePayload) {
    const client = yield* httpClient

    const request = HttpClientRequest.post('/workspaces').pipe(
      HttpClientRequest.setBody(yield* HttpBody.json(payload)),
    )

    return yield* client.execute(request).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(Workspace.pipe(Schema.omit('_tag'))),
      ),
      Effect.map(
        (workspace) =>
          new Workspace({
            id: workspace.id,
            name: workspace.name,
            createdAt: new Date(workspace.createdAt),
            updatedAt: new Date(workspace.updatedAt),
          }),
      ),
      Effect.tapError(Effect.logError),
    )
  }),

  getWorkspace: Effect.fn(function* (id: WorkspaceId) {
    const client = yield* httpClient

    return yield* client.get(`/workspaces/${id}`).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(Workspace.pipe(Schema.omit('_tag'))),
      ),
      Effect.map(
        (workspace) =>
          new Workspace({
            id: workspace.id,
            name: workspace.name,
            createdAt: new Date(workspace.createdAt),
            updatedAt: new Date(workspace.updatedAt),
          }),
      ),
      Effect.tapError(Effect.logError),
    )
  }),

  updateWorkspace: Effect.fn(function* (id: WorkspaceId, name: string) {
    const client = yield* httpClient

    const request = HttpClientRequest.put(`/workspaces/${id}`).pipe(
      HttpClientRequest.setBody(yield* HttpBody.json({ name })),
    )

    return yield* client.execute(request).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(Workspace.pipe(Schema.omit('_tag'))),
      ),
      Effect.map(
        (workspace) =>
          new Workspace({
            id: workspace.id,
            name: workspace.name,
            createdAt: new Date(workspace.createdAt),
            updatedAt: new Date(workspace.updatedAt),
          }),
      ),
      Effect.tapError(Effect.logError),
    )
  }),

  deleteWorkspace: Effect.fn(function* (id: WorkspaceId) {
    const client = (yield* httpClient).pipe(
      HttpClient.filterStatus((status) => status === 204),
    )

    const request = HttpClientRequest.del(`/workspaces/${id}`).pipe()

    yield* client.execute(request)
  }),
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
    UseQueryOptions<ReadonlyArray<Workspace>, Error, ReadonlyArray<Workspace>>,
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
    const runtime = useRuntime()

    return useQuery({
      queryKey: queryKeys.lists(),
      queryFn: () => workspaceApi.getWorkspaces().pipe(runtime.runPromise),
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    })
  }

  export const useWorkspace = (
    id: WorkspaceId,
    options?: WorkspaceQueryOptions,
  ) => {
    const runtime = useRuntime()
    const queryClient = useQueryClient()

    return useQuery({
      queryKey: queryKeys.detail(id),
      queryFn: () => workspaceApi.getWorkspace(id).pipe(runtime.runPromise),
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
    const runtime = useRuntime()
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: (payload: CreateWorkspacePayload) =>
        workspaceApi.createWorkspace(payload).pipe(runtime.runPromise),
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
    const runtime = useRuntime()
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: ({ id, name }: { id: WorkspaceId; name: string }) =>
        workspaceApi.updateWorkspace(id, name).pipe(runtime.runPromise),
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
    const runtime = useRuntime()
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: (id: WorkspaceId) =>
        workspaceApi.deleteWorkspace(id).pipe(runtime.runPromise),
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
