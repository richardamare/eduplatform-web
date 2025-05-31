import * as Schema from 'effect/Schema'
import * as SchemaUtils from '@/types/utils'

export const ChatId = Schema.String.pipe(Schema.brand('ChatId'))
export type ChatId = typeof ChatId.Type

export class Chat extends Schema.TaggedClass<Chat>('Chat')('Chat', {
  id: ChatId,
  name: Schema.String,
  createdAt: SchemaUtils.Timestamp,
  updatedAt: SchemaUtils.Timestamp,
}) {}
