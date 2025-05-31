import { Folder, Plus } from 'lucide-react'

import type { Workspace } from '@/types/workspace'

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
import { mockWorkspaces } from '@/lib/mock-data'

interface WorkspacesSidebarProps {
  onWorkspaceSelect?: (workspace: Workspace) => void
  selectedWorkspaceId?: string
}

export function WorkspacesSidebar({
  onWorkspaceSelect,
  selectedWorkspaceId,
  ...props
}: WorkspacesSidebarProps & React.ComponentProps<typeof Sidebar>) {
  const handleWorkspaceClick = (workspace: Workspace) => {
    onWorkspaceSelect?.(workspace)
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Workspaces</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mockWorkspaces.map((workspace) => (
                <SidebarMenuItem key={workspace.id}>
                  <SidebarMenuButton
                    isActive={selectedWorkspaceId === workspace.id}
                    onClick={() => handleWorkspaceClick(workspace)}
                    className="w-full justify-start"
                  >
                    <Folder className="h-4 w-4" />
                    <span className="truncate">{workspace.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
