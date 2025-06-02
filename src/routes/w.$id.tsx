import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/w/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/w/$id"!</div>
}
