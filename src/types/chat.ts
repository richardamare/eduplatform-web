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

export const ChatDto = Schema.Struct({
  id: Schema.String,
  name: Chat.fields.name,
  created_at: Chat.fields.createdAt,
  updated_at: Chat.fields.updatedAt,
})
export type ChatDto = typeof ChatDto.Type
