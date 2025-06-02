import { MODAL_TYPE, useModal } from '@/hooks/use-modal'

export const ModalProvider = () => {
  const modals = useModal((state) => state.modals)

  return (
    <>
      {Object.entries(modals).map(([id, { type, props }]) => {
        switch (type) {
          case MODAL_TYPE.CREATE_WORKSPACE:
            return <div>CreateWorkspaceDialog</div>
          case MODAL_TYPE.RENAME_CHAT:
            return <div>RenameChatDialog</div>
          default:
            return null
        }
      })}
    </>
  )
}
