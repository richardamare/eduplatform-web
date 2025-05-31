import * as Schema from 'effect/Schema'
import * as Data from 'effect/Data'
import * as SchemaUtils from '@/types/utils'

export class WorkspaceNameAlreadyExistsError extends Data.TaggedError(
  'WorkspaceNameAlreadyExistsError',
)<{
  readonly name: string
}> {
  get message() {
    return `Workspace '${this.name}' already exists`
  }
}

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

export class CreateWorkspacePayload extends Schema.TaggedClass<CreateWorkspacePayload>(
  'CreateWorkspacePayload',
)('CreateWorkspacePayload', {
  name: Workspace.fields.name,
}) {}
