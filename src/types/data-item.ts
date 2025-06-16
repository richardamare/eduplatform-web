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
  items: Schema.Array(
    Schema.Struct({
      question: Schema.String,
      answer: Schema.String,
    }),
  ),
  total_count: Schema.Number,
  topic: Schema.String,
})
export type FlashcardDto = typeof FlashcardDto.Type

export class Flashcard extends Schema.TaggedClass<Flashcard>('Flashcard')(
  'Flashcard',
  {
    items: Schema.Array(
      Schema.Struct({
        answer: Schema.String,
        question: Schema.String,
      }),
    ),
    totalCount: Schema.Number,
    topic: Schema.String,
  },
) {}

export const ExamDto = Schema.Struct({
  items: Schema.Array(
    Schema.Struct({
      question: Schema.String,
      answers: Schema.Struct({
        A: Schema.String,
        B: Schema.String,
        C: Schema.String,
        D: Schema.String,
      }),
      correct_answer: Schema.String,
    }),
  ),
  total_count: Schema.Number,
  topic: Schema.String,
})
export type ExamDto = typeof ExamDto.Type

export class Exam extends Schema.TaggedClass<Exam>('Exam')('Exam', {
  items: Schema.Array(
    Schema.Struct({
      question: Schema.String,
      answers: Schema.Struct({
        A: Schema.String,
        B: Schema.String,
        C: Schema.String,
        D: Schema.String,
      }),
      correctAnswer: Schema.String,
    }),
  ),
  totalCount: Schema.Number,
  topic: Schema.String,
}) {}
