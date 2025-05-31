import { Home, MessageSquare, Plus } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'
import type { Workspace } from '@/types/workspace'
import type { Chat, ChatId } from '@/types/chat'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

interface ChatsSidebarProps {
  workspace: Workspace
  chats: Array<Chat>
}

export function ChatsSidebar({ workspace, chats }: ChatsSidebarProps) {
  const location = useLocation()

  // Determine active states based on current location
  const isOverviewActive =
    location.pathname === `/w/${workspace.id}` ||
    location.pathname === `/w/${workspace.id}/`
  const isNewChatActive = location.pathname === `/w/${workspace.id}/c/new`

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold truncate">{workspace.name}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link to="/w/$id/c/new" params={{ id: workspace.id }}>
              <Plus className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isOverviewActive}
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/w/$id" params={{ id: workspace.id }}>
                    <Home className="h-4 w-4" />
                    <span>Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isNewChatActive}
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/w/$id/c/new" params={{ id: workspace.id }}>
                    <Plus className="h-4 w-4" />
                    <span>New Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-1">
              <h3 className="text-sm font-medium text-muted-foreground">
                Chats
              </h3>
            </div>
            <SidebarMenu>
              {chats.length > 0 ? (
                chats.map((chat) => {
                  const isChatActive =
                    location.pathname === `/w/${workspace.id}/c/${chat.id}`

                  return (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        isActive={isChatActive}
                        className="w-full justify-start"
                        asChild
                      >
                        <Link
                          to="/w/$id/c/$chatId"
                          params={{ id: workspace.id, chatId: chat.id }}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span className="truncate">{chat.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No chats in this workspace
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
