import { useMutation, useQuery } from '@tanstack/react-query'
import * as Effect from 'effect/Effect'
import * as Option from 'effect/Option'
import * as Array from 'effect/Array'
import { pipe } from 'effect/Function'
import {
  type CreateWorkspacePayload,
  Workspace,
  WorkspaceId,
} from '@/types/workspace'
import { mockWorkspaces } from '@/lib/mock-data'
import { randomDelay } from '@/lib/utils'

export namespace WorkspaceQueries {
  export function useWorkspaces() {
    return useQuery({
      queryKey: ['workspaces'],
      queryFn: () =>
        Effect.gen(function* () {
          yield* randomDelay
          return mockWorkspaces
        }).pipe(Effect.runPromise),
    })
  }

  export function useWorkspaceDetail(id: WorkspaceId) {
    return useQuery({
      queryKey: ['workspace', id],
      queryFn: () =>
        Effect.gen(function* () {
          yield* randomDelay
          return pipe(
            mockWorkspaces,
            Array.findFirst((w) => w.id === id),
            Option.getOrNull,
          )
        }).pipe(Effect.runPromise),
    })
  }

  export function useCreateWorkspace() {
    return useMutation({
      mutationFn: (payload: CreateWorkspacePayload) =>
        Effect.gen(function* () {
          yield* randomDelay
          return [
            ...mockWorkspaces,
            new Workspace({
              id: WorkspaceId.make(`ws_${mockWorkspaces.length + 1}`),
              name: payload.name,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          ]
        }).pipe(Effect.runPromise),
    })
  }
}
