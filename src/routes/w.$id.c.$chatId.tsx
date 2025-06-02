import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/w/$id/c/$chatId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/w/$id/c/$chatId"!</div>
}
