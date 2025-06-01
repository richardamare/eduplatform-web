import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Folder, Plus } from 'lucide-react'

import type { Workspace } from '@/types/workspace'

import { Card, CardContent } from '@/components/ui/card'
import { useModal } from '@/hooks/use-modal'
import { MODAL_TYPE } from '@/types/modal'
import { WorkspaceQueries } from '@/data-access/workspace-queries'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const navigate = useNavigate()
  const openModal = useModal((s) => s.open)

  const workspacesQuery = WorkspaceQueries.useWorkspaces()
  const workspaces = workspacesQuery.data ?? []

  const handleWorkspaceClick = (workspace: Workspace) => {
    navigate({ to: `/w/${workspace.id}` })
  }

  const handleCreateWorkspace = () => {
    openModal({ type: MODAL_TYPE.CREATE_WORKSPACE, props: {} })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Workspaces</h1>
          <p className="text-xl text-muted-foreground">
            Select a workspace to continue learning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {workspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              onClick={() => handleWorkspaceClick(workspace)}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-2xl flex items-center justify-center">
                    <Folder className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold leading-snug">
                  {workspace.name}
                </h3>
              </CardContent>
            </Card>
          ))}

          <Card
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 border-dashed border-muted-foreground/30 hover:border-primary/50"
            onClick={handleCreateWorkspace}
          >
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto border-2 border-dashed border-muted-foreground/50 rounded-2xl flex items-center justify-center hover:border-primary/50 transition-colors">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-muted-foreground">
                Add Workspace
              </h3>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
