import { createFileRoute } from '@tanstack/react-router'
import { env } from '@/env'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return <pre>{JSON.stringify(env.VITE_SERVER_URL, null, 2)}</pre>
}
