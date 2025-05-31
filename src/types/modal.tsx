export enum MODAL_TYPE {
  CREATE_WORKSPACE = 'CREATE_WORKSPACE',
  RENAME_CHAT = 'RENAME_CHAT',
}

interface CreateWorkspaceModalPayload {
  type: MODAL_TYPE.CREATE_WORKSPACE
  props: {}
}

interface RenameChatModalPayload {
  type: MODAL_TYPE.RENAME_CHAT
  props: {
    chatId: string
  }
}

export type OpenModalPayload =
  | CreateWorkspaceModalPayload
  | RenameChatModalPayload
