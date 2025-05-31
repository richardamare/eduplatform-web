import { Home, MessageSquare, Plus } from 'lucide-react'
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

type SelectedView = 'overview' | 'newChat' | `chat-${typeof ChatId.Type}`

interface ChatsSidebarProps {
  workspace: Workspace
  selectedView: SelectedView
  chats: Array<Chat>
  onSelect: (chat?: Chat) => void
  onNewChat: () => void
}

export function ChatsSidebar({
  workspace,
  selectedView,
  chats,
  onSelect,
  onNewChat,
}: ChatsSidebarProps) {
  const handleChatSelect = (chat: Chat) => {
    onSelect(chat)
  }

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold truncate">{workspace.name}</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedView === 'overview'}
                  onClick={() => onSelect()}
                  className="w-full justify-start"
                >
                  <Home className="h-4 w-4" />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedView === 'newChat'}
                  onClick={() => onNewChat()}
                  className="w-full justify-start"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Chat</span>
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
                chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      isActive={selectedView === `chat-${chat.id}`}
                      onClick={() => handleChatSelect(chat)}
                      className="w-full justify-start"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="truncate">{chat.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
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
