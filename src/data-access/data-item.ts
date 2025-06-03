import type { WorkspaceId } from '@/types/workspace'
import { Effect, Schema } from 'effect'
import { httpClient } from '@/data-access/api'
import {
  HttpBody,
  HttpClientRequest,
  HttpClientResponse,
} from '@effect/platform'
import { ExamDto, FlashcardDto } from '@/types/data-item'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import { useRuntime } from '@/hooks/use-runtime'

export const dataItemApi = {
  getFlashcards: Effect.fn(function* (workspaceId: WorkspaceId) {
    const http = yield* httpClient

    const request = HttpClientRequest.get(
      `/workspaces/${workspaceId}/flashcards`,
    )

    return yield* http.execute(request).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(Schema.Array(FlashcardDto), {
          errors: 'all',
        }),
      ),
    )
  }),
  createFlashcard: Effect.fn(function* (
    workspaceId: WorkspaceId,
    topic: string,
  ) {
    const http = yield* httpClient
    const request = HttpClientRequest.post('/flashcards').pipe(
      HttpClientRequest.setBody(
        yield* HttpBody.json({ workspaceId, workspace_id: workspaceId, topic }),
      ),
    )

    return yield* http.execute(request).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(FlashcardDto, {
          errors: 'all',
        }),
      ),
    )
  }),

  getExams: Effect.fn(function* (workspaceId: WorkspaceId) {
    const http = yield* httpClient

    const request = HttpClientRequest.get(`/workspaces/${workspaceId}/exams`)

    return yield* http.execute(request).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(Schema.Array(ExamDto), {
          errors: 'all',
        }),
      ),
    )
  }),

  createExam: Effect.fn(function* (workspaceId: WorkspaceId, topic: string) {
    const http = yield* httpClient

    const request = HttpClientRequest.post('/exams').pipe(
      HttpClientRequest.setBody(yield* HttpBody.json({ workspaceId, topic })),
    )

    return yield* http.execute(request).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(ExamDto, {
          errors: 'all',
        }),
      ),
    )
  }),
}

export namespace DataItemQueries {
  export const queryKeys = {
    all: ['data-items'],
    flashcards: (workspaceId: WorkspaceId) => [
      ...queryKeys.all,
      'flashcards',
      workspaceId,
    ],
    exams: (workspaceId: WorkspaceId) => [
      ...queryKeys.all,
      'exams',
      workspaceId,
    ],
  }

  export type FlashcardsQueryOptions = Omit<
    UseQueryOptions<Array<FlashcardDto>, Error, Array<FlashcardDto>>,
    'queryKey' | 'queryFn'
  >

  export const useFlashcards = (
    workspaceId: WorkspaceId,
    options?: FlashcardsQueryOptions,
  ) => {
    const runtime = useRuntime()

    return useQuery({
      queryKey: queryKeys.flashcards(workspaceId),
      // queryFn: () =>
      // dataItemApi.getFlashcards(workspaceId).pipe(runtime.runPromise),
      queryFn: async () => {
        const res = await dataItemApi
          .getFlashcards(workspaceId)
          .pipe(runtime.runPromise)

        return res as Array<FlashcardDto>
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    })
  }

  export type CreateFlashcardMutationOptions = Omit<
    UseMutationOptions<
      FlashcardDto,
      Error,
      { workspaceId: WorkspaceId; topic: string }
    >,
    'mutationFn'
  >

  export const useCreate = (options?: CreateFlashcardMutationOptions) => {
    const runtime = useRuntime()

    return useMutation({
      mutationFn: (data: { workspaceId: WorkspaceId; topic: string }) =>
        dataItemApi
          .createFlashcard(data.workspaceId, data.topic)
          .pipe(runtime.runPromise),
      ...options,
    })
  }

  export type ExamsQueryOptions = Omit<
    UseQueryOptions<Array<ExamDto>, Error, Array<ExamDto>>,
    'queryKey' | 'queryFn'
  >

  export const useExams = (
    workspaceId: WorkspaceId,
    options?: ExamsQueryOptions,
  ) => {
    const runtime = useRuntime()

    return useQuery({
      queryKey: queryKeys.exams(workspaceId),
      queryFn: async () => {
        const res = await dataItemApi
          .getExams(workspaceId)
          .pipe(runtime.runPromise)

        return res as Array<ExamDto>
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    })
  }

  export type CreateExamMutationOptions = Omit<
    UseMutationOptions<
      ExamDto,
      Error,
      { workspaceId: WorkspaceId; topic: string }
    >,
    'mutationFn'
  >

  export const useCreateExam = (options?: CreateExamMutationOptions) => {
    const runtime = useRuntime()

    return useMutation({
      mutationFn: (data: { workspaceId: WorkspaceId; topic: string }) =>
        dataItemApi
          .createExam(data.workspaceId, data.topic)
          .pipe(runtime.runPromise),
      ...options,
    })
  }

  export const useInvalidateDataItems = () => {
    const queryClient = useQueryClient()

    return {
      invalidateAll: () =>
        queryClient.invalidateQueries({ queryKey: queryKeys.all }),
      invalidateWorkspaceFlashcards: (workspaceId: WorkspaceId) =>
        queryClient.invalidateQueries({
          queryKey: queryKeys.flashcards(workspaceId),
        }),
    }
  }
}
