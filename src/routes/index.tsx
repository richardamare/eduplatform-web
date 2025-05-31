import { createFileRoute, useNavigate } from '@tanstack/react-router'

import type { Workspace } from '@/types/workspace'

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { WorkspacesSidebar } from '@/components/workspaces-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const navigate = useNavigate()

  const handleWorkspaceSelect = (workspace: Workspace) => {
    navigate({ to: `/workspaces/${workspace.id}` })
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '350px',
        } as React.CSSProperties
      }
    >
      <WorkspacesSidebar onWorkspaceSelect={handleWorkspaceSelect} />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Workspaces</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold">Select a Workspace</h1>
            <p className="text-muted-foreground mt-2">
              Choose a workspace from the sidebar to get started
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
