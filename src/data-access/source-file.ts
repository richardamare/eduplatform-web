import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { type WorkspaceId } from '@/types/workspace'
import { Effect, Schema } from 'effect'
import { httpClient } from './api'
import {
  HttpBody,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from '@effect/platform'
import { SourceFile, SourceFileDto, SourceFileId } from '@/types/source-file'
import { useRuntime } from '@/hooks/use-runtime'

const mapContentTypeToType = (contentType: string) => {
  if (contentType.includes('image')) return 'image'
  if (contentType.includes('video')) return 'video'
  if (contentType.includes('audio')) return 'audio'
  return 'file'
}

const fileApi = {
  getFiles: Effect.fn(function* (workspaceId: WorkspaceId) {
    const client = yield* httpClient

    const request = HttpClientRequest.get(`/workspaces/${workspaceId}/files`)

    return yield* client.execute(request).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(Schema.Array(SourceFileDto)),
      ),
      Effect.map((files) =>
        files.map(
          (file) =>
            new SourceFile({
              id: SourceFileId.make(file.id),
              name: file.file_name,
              type: mapContentTypeToType(file.content_type),
              size: file.file_size,
              createdAt: new Date(file.created_at),
            }),
        ),
      ),
    )
  }),

  uploadFile: Effect.fn(function* (
    workspaceId: WorkspaceId,
    file: globalThis.File,
  ) {
    const client = yield* httpClient

    const fileName = encodeURIComponent(file.name.replace(/\s+/g, '_'))

    const uploadUrlRequest = yield* HttpClientRequest.post(
      `/files/${workspaceId}/upload-url`,
    ).pipe(
      HttpClientRequest.bodyJson({
        fileName,
        fileSize: file.size,
        mimeType: file.type,
      }),
    )

    const uploadUrlResponse = yield* client.execute(uploadUrlRequest).pipe(
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(
          Schema.Struct({
            upload_url: Schema.String,
            blob_name: Schema.String,
          }),
        ),
      ),
    )

    const uploadFileRequest = uploadUrlResponse.upload_url

    yield* Effect.tryPromise(() =>
      fetch(uploadFileRequest, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type,
        },
        body: file,
      }),
    ).pipe(
      Effect.flatMap((response) =>
        response.ok
          ? Effect.succeed(undefined)
          : Effect.fail(new Error(`Upload failed: ${response.status}`)),
      ),
    )

    const confirmUploadRequest = yield* HttpClientRequest.post(
      `/files/${workspaceId}/confirm-upload`,
    ).pipe(
      HttpClientRequest.bodyJson({
        blobName: uploadUrlResponse.blob_name,
        fileName,
      }),
    )

    yield* client
      .execute(confirmUploadRequest)
      .pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(Schema.Void)))
  }),
}

export namespace SourceFileQueries {
  // Query Keys
  export const queryKeys = {
    all: ['source-files'],
    lists: () => [...queryKeys.all, 'list'],
    list: (workspaceId: WorkspaceId) => [...queryKeys.lists(), workspaceId],
  }

  // Types
  export type SourceFilesQueryOptions = Omit<
    UseQueryOptions<Array<SourceFile>, Error, Array<SourceFile>>,
    'queryKey' | 'queryFn'
  >

  export type UploadMutationOptions = Omit<
    UseMutationOptions<void, Error, { workspaceId: WorkspaceId; file: File }>,
    'mutationFn'
  >

  // Hooks
  export const useSourceFiles = (
    workspaceId: WorkspaceId,
    options?: SourceFilesQueryOptions,
  ) => {
    const runtime = useRuntime()

    return useQuery({
      queryKey: queryKeys.list(workspaceId),
      queryFn: () => fileApi.getFiles(workspaceId).pipe(runtime.runPromise),
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    })
  }

  export const useUploadFile = (options?: UploadMutationOptions) => {
    const queryClient = useQueryClient()
    const runtime = useRuntime()

    return useMutation({
      mutationFn: ({ workspaceId, file }) =>
        fileApi.uploadFile(workspaceId, file).pipe(runtime.runPromise),
      onSuccess: (data, { workspaceId }) => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.list(workspaceId),
        })
      },
      ...options,
    })
  }

  // Cache management
  export const useInvalidateSourceFiles = () => {
    const queryClient = useQueryClient()

    return {
      invalidateAll: () =>
        queryClient.invalidateQueries({ queryKey: queryKeys.all }),
      invalidateWorkspaceSourceFiles: (workspaceId: WorkspaceId) =>
        queryClient.invalidateQueries({
          queryKey: queryKeys.list(workspaceId),
        }),
    }
  }
}
