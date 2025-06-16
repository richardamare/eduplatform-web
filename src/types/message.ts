import * as Schema from 'effect/Schema'
import * as SchemaUtils from '@/types/utils'

export const MessageId = Schema.String.pipe(Schema.brand('MessageId'))
export type MessageId = Schema.Schema.Type<typeof MessageId>

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export class Message extends Schema.TaggedClass<Message>('Message')('Message', {
  id: MessageId,
  content: Schema.String,
  role: Schema.Enums(MessageRole),
  createdAt: SchemaUtils.Timestamp,
}) {}

export class CreateMessagePayload extends Schema.TaggedClass<CreateMessagePayload>(
  'CreateMessagePayload',
)('CreateMessagePayload', {
  id: Message.fields.id.pipe(Schema.optional),
  content: Message.fields.content,
  role: Message.fields.role,
  createdAt: Message.fields.createdAt.pipe(Schema.optional),
}) {}

export const MessageDto = Schema.Struct({
  id: Schema.String,
  content: Schema.String,
  role: Schema.String,
  created_at: SchemaUtils.Timestamp,
})
export type MessageDto = typeof MessageDto.Type
