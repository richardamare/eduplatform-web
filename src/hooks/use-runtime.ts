import { create } from 'zustand'
import { Layer, Logger, ManagedRuntime } from 'effect'
import { FetchHttpClient, HttpClient } from '@effect/platform'

type RuntimeState = ManagedRuntime.ManagedRuntime<HttpClient.HttpClient, never>

export const useRuntime = create<RuntimeState>(() =>
  ManagedRuntime.make(Layer.mergeAll(FetchHttpClient.layer, Logger.pretty)),
)
