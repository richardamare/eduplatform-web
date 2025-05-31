import { createFileRoute } from '@tanstack/react-router'
import { Workspace } from '@/features/workspace/workspace'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return <Workspace />
}
