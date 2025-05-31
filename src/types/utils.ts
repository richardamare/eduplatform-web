import * as Schema from 'effect/Schema'

export const Timestamp = Schema.Union(
  Schema.DateFromNumber,
  Schema.DateFromString,
)
