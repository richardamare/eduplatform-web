import { createFileRoute, Link } from '@tanstack/react-router'
import { FileText, Image, FileIcon } from 'lucide-react'
import { WorkspaceId } from '@/types/workspace'
import { WorkspaceQueries } from '@/data-access/workspace'
import { AttachmentQueries } from '@/data-access/attachment'
import { DataItemQueries } from '@/data-access/data-item'
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/kibo-ui/dropzone'
import { AttachmentType, AttachmentStatus } from '@/types/attachment'

export const Route = createFileRoute('/w/$id/')({
  component: WorkspaceOverview,
})

function WorkspaceOverview() {
  const { id } = Route.useParams()
  const workspaceIdTyped = WorkspaceId.make(id)

  const workspaceQuery = WorkspaceQueries.useWorkspace(workspaceIdTyped)
  const workspace = workspaceQuery.data

  const attachmentsQuery = AttachmentQueries.useAttachments(workspaceIdTyped)
  const attachments = attachmentsQuery.data ?? []

  const flashcardsQuery = DataItemQueries.useFlashcards(workspaceIdTyped)
  const flashcardSets = flashcardsQuery.data ?? []

  const uploadFileMutation = AttachmentQueries.useUploadFile()

  const handleFileDrop = (acceptedFiles: Array<File>) => {
    acceptedFiles.forEach((file) => {
      uploadFileMutation.mutate({ workspaceId: workspaceIdTyped, file })
    })
  }

  const getAttachmentIcon = (type: AttachmentType) => {
    switch (type) {
      case AttachmentType.PDF:
        return <FileText className="h-4 w-4" />
      case AttachmentType.IMAGE:
        return <Image className="h-4 w-4" />
      default:
        return <FileIcon className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: AttachmentStatus) => {
    switch (status) {
      case AttachmentStatus.READY:
        return 'text-green-600'
      case AttachmentStatus.PROCESSING:
        return 'text-yellow-600'
      case AttachmentStatus.UPLOADED:
        return 'text-blue-600'
      default:
        return 'text-gray-600'
    }
  }

  if (!workspace) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Workspace not found</h1>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
      <div>
        <h2 className="text-2xl font-bold">{workspace.name}</h2>
        <p className="text-muted-foreground mt-2">
          Manage your workspace files and attachments
        </p>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upload Files</h3>
        <Dropzone
          accept={{
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
            'text/plain': ['.txt'],
          }}
          maxFiles={5}
          maxSize={10 * 1024 * 1024} // 10MB
          onDrop={handleFileDrop}
          disabled={uploadFileMutation.isPending}
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
        {uploadFileMutation.isPending && (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        )}
      </div>

      {/* Flashcard Sets */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Flashcard Sets ({flashcardSets.length})
        </h3>
        {flashcardSets.length === 0 ? (
          <p className="text-muted-foreground">No flashcard sets yet</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {flashcardSets.map((set, setIndex) => (
              <div
                key={setIndex}
                className="p-6 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{set.topic}</h4>
                        <p className="text-sm text-muted-foreground">
                          {set.totalCount} flashcards
                        </p>
                      </div>
                      <Link
                        to="/w/$id/flashcards/$setIndex"
                        params={{ id, setIndex: setIndex.toString() }}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Study
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {set.flashcards.map((flashcard, cardIndex) => (
                      <div
                        key={cardIndex}
                        className="p-3 bg-muted/30 rounded border"
                      >
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            Q: {flashcard.question}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            A: {flashcard.answer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attachments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Attachments ({attachments.length})
        </h3>
        {attachments.length === 0 ? (
          <p className="text-muted-foreground">No attachments yet</p>
        ) : (
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-shrink-0">
                  {getAttachmentIcon(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{attachment.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {attachment.type.toUpperCase()} •{' '}
                    <span className={getStatusColor(attachment.status)}>
                      {attachment.status}
                    </span>{' '}
                    • {attachment.createdAt.toLocaleDateString()}
                  </p>
                </div>
                {attachment.previewUrl && (
                  <button
                    onClick={() => window.open(attachment.previewUrl, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Preview
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
