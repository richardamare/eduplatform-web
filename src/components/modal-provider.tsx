import { MODAL_TYPE, useModal } from '@/hooks/use-modal'
import { GenerateFlashcardsDialog } from '@/components/generate-flashcards-dialog'
import { GenerateExamsDialog } from '@/components/generate-exams-dialog'
import { CreateWorkspaceDialog } from '@/components/create-workspace-dialog'

export const ModalProvider = () => {
  const modals = useModal((state) => state.modals)

  return (
    <>
      {Object.entries(modals).map(([id, { type, props }]) => {
        switch (type) {
          case MODAL_TYPE.CREATE_WORKSPACE:
            return <CreateWorkspaceDialog key={id} id={id} />
          case MODAL_TYPE.RENAME_CHAT:
            return <div key={id}>RenameChatDialog</div>
          case MODAL_TYPE.GENERATE_FLASHCARDS:
            return (
              <GenerateFlashcardsDialog
                key={id}
                id={id}
                workspaceId={props.workspaceId}
              />
            )
          case MODAL_TYPE.GENERATE_EXAMS:
            return (
              <GenerateExamsDialog
                key={id}
                id={id}
                workspaceId={props.workspaceId}
              />
            )
          default:
            return null
        }
      })}
    </>
  )
}
