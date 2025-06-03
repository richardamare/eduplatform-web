import { Schema } from 'effect'
import * as SchemaUtils from '@/types/utils'

export class DataItem extends Schema.TaggedClass<DataItem>('DataItem')(
  'DataItem',
  {
    id: Schema.String,
    type: Schema.Literal('flashcard'),
    content: Schema.String,
    createdAt: SchemaUtils.Timestamp,
    updatedAt: SchemaUtils.Timestamp,
  },
) {}

export const DataItemDto = Schema.Struct({
  id: DataItem.fields.id,
  type: DataItem.fields.type,
  content: DataItem.fields.content,
  created_at: DataItem.fields.createdAt,
  updated_at: DataItem.fields.updatedAt,
})
export type DataItemDto = typeof DataItemDto.Type

export const FlashcardDto = Schema.Struct({
  flashcards: Schema.Array(
    Schema.Struct({
      question: Schema.String,
      answer: Schema.String,
    }),
  ),
  totalCount: Schema.Number,
  topic: Schema.String,
})
export type FlashcardDto = typeof FlashcardDto.Type
