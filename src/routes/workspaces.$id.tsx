import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { Chat, ChatId } from '@/types/chat'
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
import { getChatsByWorkspaceId, mockWorkspaces } from '@/lib/mock-data'
import { ChatsSidebar } from '@/components/chats-sidebar'

export const Route = createFileRoute('/workspaces/$id')({
  component: WorkspaceDetail,
})

type SelectedView = 'overview' | 'newChat' | `chat-${typeof ChatId.Type}`

function WorkspaceDetail() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [selectedView, setSelectedView] = useState<SelectedView>('overview')

  const workspace = mockWorkspaces.find((w) => w.id === id)
  const workspaceChats = workspace ? getChatsByWorkspaceId(workspace.id) : []

  const handleChatSelect = (chat?: Chat) => {
    setSelectedView(chat ? `chat-${chat.id}` : 'overview')
  }

  const handleNewChat = () => {
    setSelectedView('newChat')
  }

  const renderContent = () => {
    if (!workspace) {
      return (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Workspace not found</h1>
        </div>
      )
    }

    if (selectedView === 'overview') {
      return (
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
              <p className="text-2xl font-bold text-blue-600">
                {workspaceChats.length}
              </p>
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
      )
    }

    const selectedChat = workspaceChats.find(
      (chat) => selectedView === `chat-${chat.id}`,
    )

    if (!selectedChat) {
      return (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Chat not found</h1>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">{selectedChat.name}</h2>
          <p className="text-muted-foreground">
            Created {new Date(selectedChat.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-center text-muted-foreground">
            Chat interface would go here
          </p>
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Workspace not found</h1>
          <Button asChild className="mt-4">
            <Link to="/">Back to Workspaces</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '280px',
        } as React.CSSProperties
      }
    >
      <ChatsSidebar
        workspace={workspace}
        chats={workspaceChats}
        selectedView={selectedView}
        onSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />

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
                <BreadcrumbLink asChild>
                  <Link to="/">Workspaces</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{workspace.name}</BreadcrumbPage>
              </BreadcrumbItem>
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

        <div className="flex flex-1 flex-col gap-4 p-6">{renderContent()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
