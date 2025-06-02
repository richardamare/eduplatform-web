import * as Schema from 'effect/Schema'
import * as SchemaUtils from '@/types/utils'

export const AttachmentId = Schema.String.pipe(Schema.brand('AttachmentId'))
export type AttachmentId = typeof AttachmentId.Type

export enum AttachmentType {
  PDF = 'pdf',
  IMAGE = 'image',
  TEXT = 'text',
}

export const ATTACHMENT_TYPE_MAP: Record<
  `${string}/${string}`,
  AttachmentType
> = {
  'application/pdf': AttachmentType.PDF,
  'image/png': AttachmentType.IMAGE,
  'text/plain': AttachmentType.TEXT,
} as const

export enum AttachmentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  READY = 'ready',
}

export class Attachment extends Schema.TaggedClass<Attachment>('Attachment')(
  'Attachment',
  {
    id: AttachmentId,
    name: Schema.String,
    previewUrl: Schema.URL.pipe(Schema.optional),
    type: Schema.Enums(AttachmentType),
    status: Schema.Enums(AttachmentStatus),
    createdAt: SchemaUtils.Timestamp,
  },
) {}