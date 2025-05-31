import { useModal } from '@/hooks/use-modal'
import { CreateWorkspaceDialog } from '@/components/create-workspace-dialog'
import { MODAL_TYPE } from '@/types/modal'

export const ModalProvider = () => {
  const modals = useModal((state) => state.modals)

  return (
    <>
      {Object.entries(modals).map(([id, { type, props }]) => {
        switch (type) {
          case MODAL_TYPE.CREATE_WORKSPACE:
            return <CreateWorkspaceDialog id={id} key={id} {...props} />
          default:
            return null
        }
      })}
    </>
  )
}
