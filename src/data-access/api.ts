import { Effect } from 'effect'
import { HttpClient, HttpClientRequest } from '@effect/platform'

const API_BASE_URL = 'http://localhost:8000/api/v1'

export const httpClient = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  return client.pipe(
    HttpClient.mapRequest((request) =>
      request.pipe(
        HttpClientRequest.prependUrl(API_BASE_URL),
        HttpClientRequest.setHeader('Content-Type', 'application/json'),
        HttpClientRequest.setHeader('Accept', 'application/json'),
      ),
    ),
  )
})
