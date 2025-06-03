import * as Schema from 'effect/Schema'
import * as SchemaUtils from '@/types/utils'

export const WorkspaceId = Schema.String.pipe(Schema.brand('WorkspaceId'))
export type WorkspaceId = typeof WorkspaceId.Type

export class Workspace extends Schema.TaggedClass<Workspace>('Workspace')(
  'Workspace',
  {
    id: WorkspaceId,
    name: Schema.String,
    createdAt: SchemaUtils.Timestamp,
    updatedAt: SchemaUtils.Timestamp,
  },
) {}

export const WorkspaceDto = Schema.Struct({
  id: Schema.String,
  name: Workspace.fields.name,
  created_at: Workspace.fields.createdAt,
  updated_at: Workspace.fields.updatedAt,
})
export type WorkspaceDto = typeof WorkspaceDto.Type

export class CreateWorkspacePayload extends Schema.TaggedClass<CreateWorkspacePayload>(
  'CreateWorkspacePayload',
)('CreateWorkspacePayload', {
  name: Workspace.fields.name,
}) {}
