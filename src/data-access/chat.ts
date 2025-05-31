import { type UseQueryOptions, useQuery } from '@tanstack/react-query'
import * as Effect from 'effect/Effect'
import * as Option from 'effect/Option'
import * as Array from 'effect/Array'
import { pipe } from 'effect/Function'
import type { WorkspaceId } from '@/types/workspace'
import type { Chat, ChatId } from '@/types/chat'
import { getChatsByWorkspaceId } from '@/lib/mock-data'
import { randomDelay } from '@/lib/utils'

export namespace ChatQueries {
  export function useChats(
    workspaceId: WorkspaceId,
    options?: Omit<UseQueryOptions<Array<Chat>, Error>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      ...options,
      queryKey: ['chats', workspaceId],
      queryFn: () =>
        Effect.gen(function* () {
          yield* randomDelay
          const chats = yield* Effect.succeed(
            getChatsByWorkspaceId(workspaceId),
          )
          return chats
        }).pipe(Effect.runPromise),
    })
  }

  export function useChatDetail(
    workspaceId: WorkspaceId,
    chatId: ChatId,
    options?: Omit<UseQueryOptions<Chat, Error>, 'queryKey' | 'queryFn'>,
  ) {
    return useQuery({
      ...options,
      queryKey: ['chat', workspaceId, chatId],
      queryFn: () =>
        Effect.gen(function* () {
          yield* randomDelay
          return pipe(
            getChatsByWorkspaceId(workspaceId),
            Array.findFirst((c) => c.id === chatId),
            Option.getOrThrow,
          )
        }).pipe(Effect.runPromise),
    })
  }
}
