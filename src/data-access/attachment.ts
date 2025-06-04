import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { type Attachment } from '@/types/attachment'
import { type WorkspaceId } from '@/types/workspace'
import { SERVER_URL } from '@/lib/constants'

interface UploadUrlResponse {
  upload_url: string
  blob_name: string
}

const mapContentTypeToType = (contentType: string) => {
  if (contentType.includes('image')) return 'image'
  if (contentType.includes('video')) return 'video'
  if (contentType.includes('audio')) return 'audio'
  return 'file'
}

const attachmentApi = {
  async getAttachments(workspaceId: WorkspaceId): Promise<Array<Attachment>> {
    // Using mock data for now
    const response = await fetch(
      `${SERVER_URL}/workspaces/${workspaceId}/files`,
    )
    const data = await response.json()

    return data.map((attachment: any) => ({
      ...attachment,
      name: attachment.file_name,
      type: mapContentTypeToType(attachment.content_type),
      size: attachment.file_size,
      workspaceId: attachment.workspace_id,
      createdAt: new Date(attachment.created_at),
      updatedAt: new Date(attachment.updated_at),
    }))
  },

  async uploadFile(workspaceId: WorkspaceId, file: File): Promise<void> {
    // Step 1: Request upload URL from backend
    const uploadUrlResponse = await fetch(
      `${SERVER_URL}/attachments/${workspaceId}/generate-upload-url`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
        }),
      },
    )

    if (!uploadUrlResponse.ok) {
      throw new Error('Failed to get upload URL')
    }

    const data = await uploadUrlResponse.json()

    console.log('data', data)

    const { upload_url }: UploadUrlResponse = data

    // Step 2: Upload file to Azure Blob Storage
    const uploadResponse = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type,
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to Azure Blob Storage')
    }

    // Step 3: Notify backend that upload is complete
    const completeResponse = await fetch(
      `${SERVER_URL}/attachments/${workspaceId}/confirm-upload`,
      {
        method: 'POST',
        body: JSON.stringify({
          blob_name: data.blob_name,
          filename: file.name,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    if (!completeResponse.ok) {
      throw new Error('Failed to complete upload')
    }
  },
}

export namespace AttachmentQueries {
  // Query Keys
  export const queryKeys = {
    all: ['attachments'],
    lists: () => [...queryKeys.all, 'list'],
    list: (workspaceId: WorkspaceId) => [...queryKeys.lists(), workspaceId],
  }

  // Types
  export type AttachmentsQueryOptions = Omit<
    UseQueryOptions<Array<Attachment>, Error, Array<Attachment>>,
    'queryKey' | 'queryFn'
  >

  export type UploadMutationOptions = Omit<
    UseMutationOptions<void, Error, { workspaceId: WorkspaceId; file: File }>,
    'mutationFn'
  >

  // Hooks
  export const useAttachments = (
    workspaceId: WorkspaceId,
    options?: AttachmentsQueryOptions,
  ) => {
    return useQuery({
      queryKey: queryKeys.list(workspaceId),
      queryFn: () => attachmentApi.getAttachments(workspaceId),
      staleTime: 5 * 60 * 1000, // 5 minutes
      ...options,
    })
  }

  export const useUploadFile = (options?: UploadMutationOptions) => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: async ({ workspaceId, file }) => {
        await attachmentApi.uploadFile(workspaceId, file)
      },
      onSuccess: (data, { workspaceId }) => {
        // Add new attachment to cache
        queryClient.invalidateQueries({
          queryKey: queryKeys.list(workspaceId),
        })
      },
      ...options,
    })
  }

  // Cache management
  export const useInvalidateAttachments = () => {
    const queryClient = useQueryClient()

    return {
      invalidateAll: () =>
        queryClient.invalidateQueries({ queryKey: queryKeys.all }),
      invalidateWorkspaceAttachments: (workspaceId: WorkspaceId) =>
        queryClient.invalidateQueries({
          queryKey: queryKeys.list(workspaceId),
        }),
    }
  }
}
