import { useQuery } from '@tanstack/react-query'
import * as Effect from 'effect/Effect'
import * as Random from 'effect/Random'
import { mockWorkspaces } from '@/lib/mock-data'

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () =>
      Effect.gen(function* () {
        const random = yield* Random.Random
        const num = yield* random.nextInt
        yield* Effect.sleep(num)
        return mockWorkspaces
      }),
  })
}
