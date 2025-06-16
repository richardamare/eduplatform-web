import { createFileRoute, Link } from '@tanstack/react-router'
import {
  FileText,
  Image,
  FileIcon,
  Sparkles,
  GraduationCap,
} from 'lucide-react'
import { WorkspaceId } from '@/types/workspace'
import { WorkspaceQueries } from '@/data-access/workspace'
import { SourceFileQueries } from '@/data-access/source-file'
import { GeneratedContentQueries } from '@/data-access/generated-content'
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from '@/components/ui/kibo-ui/dropzone'
import { Button } from '@/components/ui/button'
import { useModal, MODAL_TYPE } from '@/hooks/use-modal'

export const Route = createFileRoute('/w/$id/')({
  component: WorkspaceOverview,
})

function WorkspaceOverview() {
  const { id } = Route.useParams()
  const workspaceIdTyped = WorkspaceId.make(id)
  const openModal = useModal((state) => state.open)

  const workspaceQuery = WorkspaceQueries.useWorkspace(workspaceIdTyped)
  const workspace = workspaceQuery.data

  const sourceFilesQuery = SourceFileQueries.useSourceFiles(workspaceIdTyped)
  const sourceFiles = sourceFilesQuery.data ?? []

  const flashcardsQuery =
    GeneratedContentQueries.useFlashcards(workspaceIdTyped)
  const flashcardSets = flashcardsQuery.data ?? []

  const examsQuery = GeneratedContentQueries.useExams(workspaceIdTyped)
  const exams = examsQuery.data ?? []

  const uploadFileMutation = SourceFileQueries.useUploadFile()

  const handleFileDrop = (acceptedFiles: Array<File>) => {
    console.log('acceptedFiles', acceptedFiles)
    acceptedFiles.forEach((file) => {
      uploadFileMutation.mutate({ workspaceId: workspaceIdTyped, file })
    })
  }

  const getSourceFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-4 w-4" />
      case 'image':
        return <Image className="h-4 w-4" />
      default:
        return <FileIcon className="h-4 w-4" />
    }
  }

  if (workspaceQuery.isLoading) {
    return <div>Loading...</div>
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
          Manage your workspace files and generated content
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

      {/* Files List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Files ({sourceFiles.length})</h3>
        {sourceFiles.length === 0 ? (
          <p className="text-muted-foreground">No files yet</p>
        ) : (
          <div className="space-y-2">
            {sourceFiles.map((sourceFile) => (
              <div
                key={sourceFile.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex-shrink-0">
                  {getSourceFileIcon(sourceFile.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{sourceFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {sourceFile.type.toUpperCase()} •{' '}
                    {sourceFile.createdAt.toLocaleDateString()}
                  </p>
                </div>
                {/* {sourceFile.previewUrl && (
                  <button
                    onClick={() => window.open(sourceFile.previewUrl, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Preview
                  </button>
                )} */}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flashcard Sets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Flashcard Sets ({flashcardSets.length})
          </h3>
          <Button
            onClick={() =>
              openModal({
                type: MODAL_TYPE.GENERATE_FLASHCARDS,
                props: { workspaceId: id },
              })
            }
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Flashcards
          </Button>
        </div>
        {flashcardSets.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-3">No flashcard sets yet</p>
            <p className="text-sm text-muted-foreground/75 mb-4">
              Generate AI-powered flashcards on any topic to start studying
            </p>
            <Button
              onClick={() =>
                openModal({
                  type: MODAL_TYPE.GENERATE_FLASHCARDS,
                  props: { workspaceId: id },
                })
              }
              variant="outline"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate Your First Set
            </Button>
          </div>
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
                    {set.items.slice(0, 2).map((item, cardIndex) => (
                      <div
                        key={cardIndex}
                        className="p-3 bg-muted/30 rounded border"
                      >
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            Q: {item.question}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            A: {item.answer}
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

      {/* Exams */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Exams ({exams.length})</h3>
          <Button
            onClick={() =>
              openModal({
                type: MODAL_TYPE.GENERATE_EXAMS,
                props: { workspaceId: id },
              })
            }
            className="flex items-center gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            Generate Exam
          </Button>
        </div>
        {exams.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <GraduationCap className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-3">No exams yet</p>
            <p className="text-sm text-muted-foreground/75 mb-4">
              Generate AI-powered exams to test your knowledge
            </p>
            <Button
              onClick={() =>
                openModal({
                  type: MODAL_TYPE.GENERATE_EXAMS,
                  props: { workspaceId: id },
                })
              }
              variant="outline"
              className="flex items-center gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Generate Your First Exam
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exams.map((exam, examIndex) => (
              <div
                key={examIndex}
                className="p-6 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-4">
                  <div className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{exam.topic}</h4>
                        <p className="text-sm text-muted-foreground">
                          {exam.totalCount} questions
                        </p>
                      </div>
                      <Link
                        to="/w/$id/exams/$examIndex"
                        params={{ id, examIndex: examIndex.toString() }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Take Exam
                      </Link>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {exam.items.slice(0, 2).map((item, questionIndex) => (
                      <div
                        key={questionIndex}
                        className="p-3 bg-muted/30 rounded border"
                      >
                        <div className="space-y-2">
                          <div className="text-sm font-medium">
                            {item.question}
                          </div>
                          <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1">
                            {Object.entries(item.answers).map(
                              ([key, value]) => (
                                <span key={key}>
                                  {key}: {value}
                                </span>
                              ),
                            )}
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
    </div>
  )
}
