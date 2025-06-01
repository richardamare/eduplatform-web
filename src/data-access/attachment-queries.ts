import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import { type Attachment } from '@/types/attachment'
import { type WorkspaceId } from '@/types/workspace'
import { getAttachmentsByWorkspaceId } from '@/lib/mock-data'

const API_BASE_URL = 'http://localhost:5131/api'

interface UploadUrlResponse {
  uploadUrl: string
  attachmentId: string
}

const attachmentApi = {
  async getAttachments(workspaceId: WorkspaceId): Promise<Array<Attachment>> {
    // Using mock data for now
    return getAttachmentsByWorkspaceId(workspaceId)
  },

  async uploadFile(workspaceId: WorkspaceId, file: File): Promise<Attachment> {
    // Step 1: Request upload URL from backend
    const uploadUrlResponse = await fetch(
      `${API_BASE_URL}/workspaces/${workspaceId}/attachments/upload-url`,
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

    const { uploadUrl, attachmentId }: UploadUrlResponse =
      await uploadUrlResponse.json()

    // Step 2: Upload file to Azure Blob Storage
    const uploadResponse = await fetch(uploadUrl, {
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
      `${API_BASE_URL}/workspaces/${workspaceId}/attachments/${attachmentId}/complete`,
      {
        method: 'POST',
      },
    )

    if (!completeResponse.ok) {
      throw new Error('Failed to complete upload')
    }

    const attachment: Attachment = await completeResponse.json()
    return attachment
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
    UseMutationOptions<
      Attachment,
      Error,
      { workspaceId: WorkspaceId; file: File }
    >,
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
      mutationFn: ({ workspaceId, file }) =>
        attachmentApi.uploadFile(workspaceId, file),
      onSuccess: (newAttachment, { workspaceId }) => {
        // Add new attachment to cache
        queryClient.setQueryData<Array<Attachment>>(
          queryKeys.list(workspaceId),
          (oldAttachments = []) => [...oldAttachments, newAttachment],
        )
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
