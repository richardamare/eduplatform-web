import * as Schema from 'effect/Schema'
import * as SchemaUtils from '@/types/utils'

export const MessageId = Schema.String.pipe(Schema.brand('MessageId'))

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export class Message extends Schema.TaggedClass<Message>('Message')('Message', {
  id: MessageId,
  content: Schema.String,
  role: Schema.Enums(MessageRole),
  createdAt: SchemaUtils.Timestamp,
}) {}
