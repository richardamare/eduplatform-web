import { Link, Outlet, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ChatsSidebar } from '@/components/chats-sidebar'
import { WorkspaceQueries } from '@/data-access/workspace'
import { WorkspaceId } from '@/types/workspace'
import { ChatQueries } from '@/data-access/chat'

export const Route = createFileRoute('/w/$id')({
  component: WorkspaceDetail,
})

function WorkspaceDetail() {
  const { id, ...params } = Route.useParams()
  const workspaceIdTyped = WorkspaceId.make(id)

  const { data: workspace } = WorkspaceQueries.useWorkspace(workspaceIdTyped)
  const { data: workspaceChats = [] } = ChatQueries.useChats(workspaceIdTyped)

  const selectedChat = useMemo(() => {
    if (!(params as any).chatId) return false
    return workspaceChats?.find((c) => c.id === (params as any).chatId)
  }, [workspaceChats, params])

  // if (!workspace) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold">Workspace not found</h1>
  //         <Button asChild className="mt-4">
  //           <Link to="/">Back to Workspaces</Link>
  //         </Button>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '280px',
        } as React.CSSProperties
      }
    >
      {workspace && (
        <ChatsSidebar workspace={workspace} chats={workspaceChats} />
      )}

      <SidebarInset className="max-h-screen h-full overflow-hidden">
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb className="z-50">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Workspaces</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {workspace && (
                <BreadcrumbItem>
                  <BreadcrumbPage>{workspace.name}</BreadcrumbPage>
                </BreadcrumbItem>
              )}
              {selectedChat && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{selectedChat.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </header>

        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
