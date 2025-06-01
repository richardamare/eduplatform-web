import { createFileRoute } from '@tanstack/react-router'
import { WorkspaceId } from '@/types/workspace'
import { WorkspaceQueries } from '@/data-access/workspace-queries'
import { ChatQueries } from '@/data-access/chat-queries'

export const Route = createFileRoute('/w/$id/')({
  component: WorkspaceOverview,
})

function WorkspaceOverview() {
  const { id } = Route.useParams()

  const workspaceQuery = WorkspaceQueries.useWorkspace(WorkspaceId.make(id))
  const workspace = workspaceQuery.data

  const chatsQuery = ChatQueries.useChats(WorkspaceId.make(id))
  const chats = chatsQuery.data ?? []

  if (!workspace) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Workspace not found</h1>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{workspace.name}</h2>
          <p className="text-muted-foreground mt-2">
            Workspace overview and analytics
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold">Total Chats</h3>
            <p className="text-2xl font-bold text-blue-600">{chats.length}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold">Created</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(workspace.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold">Status</h3>
            <p className="text-sm text-green-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  )
}
