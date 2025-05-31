import * as React from 'react'
import { FileIcon, UploadIcon, XIcon } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

type FileState = 'uploaded' | 'processing' | 'ready'

type FileRecord = {
  id: string
  name: string
  url: string
  state: FileState
}

const data = {
  files: [
    {
      id: '1',
      name: 'Introduction to React',
      url: '/files/introduction-to-react.pdf',
      state: 'ready',
    },
    {
      id: '2',
      name: 'TypeScript Handbook',
      url: '/files/typescript-handbook.pdf',
      state: 'ready',
    },
    {
      id: '3',
      name: 'Component Patterns',
      url: '/files/component-patterns.pdf',
      state: 'processing',
    },
    {
      id: '4',
      name: 'React Hooks Guide',
      url: '/files/react-hooks-guide.pdf',
      state: 'ready',
    },
    {
      id: '5',
      name: 'CSS Fundamentals',
      url: '/files/css-fundamentals.pdf',
      state: 'uploaded',
    },
    {
      id: '6',
      name: 'JavaScript Basics',
      url: '/files/javascript-basics.txt',
      state: 'ready',
    },
    {
      id: '7',
      name: 'Advanced JS Concepts',
      url: '/files/advanced-js-concepts.txt',
      state: 'ready',
    },
    {
      id: '8',
      name: 'Algorithm Notes',
      url: '/files/algorithm-notes.txt',
      state: 'processing',
    },
    {
      id: '9',
      name: 'Data Structures',
      url: '/files/data-structures.txt',
      state: 'ready',
    },
    {
      id: '10',
      name: 'Design Patterns',
      url: '/files/design-patterns.txt',
      state: 'ready',
    },
    {
      id: '11',
      name: 'System Architecture',
      url: '/files/system-architecture.pdf',
      state: 'uploaded',
    },
    {
      id: '12',
      name: 'Database Design',
      url: '/files/database-design.pdf',
      state: 'ready',
    },
    {
      id: '13',
      name: 'API Documentation',
      url: '/files/api-documentation.pdf',
      state: 'ready',
    },
    {
      id: '14',
      name: 'Testing Strategies',
      url: '/files/testing-strategies.pdf',
      state: 'processing',
    },
    {
      id: '15',
      name: 'Performance Optimization',
      url: '/files/performance-optimization.pdf',
      state: 'ready',
    },
    {
      id: '16',
      name: 'UI Design Principles',
      url: '/files/ui-design-principles.pdf',
      state: 'ready',
    },
    {
      id: '17',
      name: 'Accessibility Guidelines',
      url: '/files/accessibility-guidelines.pdf',
      state: 'uploaded',
    },
    {
      id: '18',
      name: 'React Component Diagram',
      url: '/files/react-component-diagram.png',
      state: 'ready',
    },
    {
      id: '19',
      name: 'Architecture Overview',
      url: '/files/architecture-overview.png',
      state: 'ready',
    },
    {
      id: '20',
      name: 'Database Schema',
      url: '/files/database-schema.png',
      state: 'processing',
    },
  ] as Array<FileRecord>,
}

type Props = React.ComponentProps<typeof Sidebar>

export const FilesSidebar: React.FC<Props> = ({ ...props }) => {
  const handleUpload = () => {
    // Handle file upload
  }

  const handleDelete = (fileId: string) => {
    // Handle file deletion
    alert(`Deleting file ${fileId}`)
  }

  return (
    <Sidebar {...props} collapsible="offcanvas">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>All materials</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 pb-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={handleUpload}
              >
                <UploadIcon className="h-4 w-4" />
                Upload materials
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="pr-2">
                <SidebarMenu>
                  {data.files.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      onDelete={handleDelete}
                    />
                  ))}
                </SidebarMenu>
              </div>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

const FileItem = ({
  file,
  onDelete,
}: {
  file: FileRecord
  onDelete: (fileId: string) => void
}) => {
  const getStateVariant = (state: FileState) => {
    switch (state) {
      case 'uploaded':
        return 'secondary'
      case 'processing':
        return 'default'
      case 'ready':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getStateColor = (state: FileState) => {
    switch (state) {
      case 'uploaded':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'ready':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(file.id)
  }

  return (
    <SidebarMenuItem>
      <div className="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent group">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileIcon className="h-4 w-4 flex-shrink-0" />
          <div className="flex flex-col gap-1 min-w-0">
            <span className="truncate text-sm">{file.name}</span>
            <Badge
              variant={getStateVariant(file.state)}
              className={`${getStateColor(file.state)} text-xs w-fit`}
            >
              {file.state}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-destructive/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDeleteClick}
          >
            <XIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </SidebarMenuItem>
  )
}
