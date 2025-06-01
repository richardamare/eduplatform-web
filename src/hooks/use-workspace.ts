import { useEffect } from 'react'
import { useWorkspaceStore } from '@/stores'
import { type WorkspaceId } from '@/types/workspace'

export const useWorkspaces = () => {
  const workspaces = useWorkspaceStore((state) =>
    Object.values(state.workspaces),
  )
  const loading = useWorkspaceStore((state) => state.loading.workspaces)
  const error = useWorkspaceStore((state) => state.errors.workspaces)
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces)
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace)
  const clearErrors = useWorkspaceStore((state) => state.clearWorkspaceErrors)

  useEffect(() => {
    if (workspaces.length === 0 && !loading) {
      loadWorkspaces()
    }
  }, [workspaces.length, loading, loadWorkspaces])

  return {
    workspaces,
    loading,
    error,
    createWorkspace,
    clearErrors,
    refetch: loadWorkspaces,
  }
}

export const useWorkspace = (id: WorkspaceId) => {
  const workspace = useWorkspaceStore((state) => state.getWorkspace(id))
  const loading = useWorkspaceStore((state) => state.loading.workspaces)
  const error = useWorkspaceStore((state) => state.errors.workspaces)
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces)

  useEffect(() => {
    if (!workspace && !loading) {
      loadWorkspaces()
    }
  }, [workspace, loading, loadWorkspaces])

  return {
    workspace,
    loading,
    error,
    refetch: loadWorkspaces,
  }
}
