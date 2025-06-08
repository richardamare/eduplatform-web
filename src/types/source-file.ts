import { Schema } from 'effect'
import * as SchemaUtils from '@/types/utils'

export const SourceFileId = Schema.String.pipe(Schema.brand('SourceFileId'))
export type SourceFileId = typeof SourceFileId.Type

export const SourceFileDto = Schema.Struct({
  id: Schema.String,
  file_name: Schema.String,
  content_type: Schema.String,
  file_size: Schema.Number.pipe(Schema.optional),
  created_at: Schema.String,
})

export type SourceFileDto = typeof SourceFileDto.Type

export class SourceFile extends Schema.TaggedClass<SourceFile>('SourceFile')(
  'SourceFile',
  {
    id: SourceFileId,
    name: Schema.String,
    type: Schema.String,
    size: Schema.Number.pipe(Schema.optional),
    createdAt: SchemaUtils.Timestamp,
  },
) {}
