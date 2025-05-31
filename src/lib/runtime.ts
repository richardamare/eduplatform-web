import * as FetchHttpClient from '@effect/platform/FetchHttpClient'
import * as ManagedRuntime from 'effect/ManagedRuntime'
import * as Layer from 'effect/Layer'

export const runtime = ManagedRuntime.make(
  Layer.mergeAll(FetchHttpClient.layer),
)
