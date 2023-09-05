import { NextResponse } from 'next/server'
import { z } from 'zod'
import { EventNotifier, getSSEWriter } from 'ts-sse'
import { rickAstleySchema } from './types'

export const dynamic = 'force-dynamic'


type SyncEvents = EventNotifier<{
  update: {
    data: z.infer<typeof rickAstleySchema>,
    event: 'update'
  }
  complete: {
    data: z.infer<typeof rickAstleySchema>
    event: 'update'
  }
  close: {
    data: never
  }
  error: {
    data: never
  }
}>

export async function GET() {
  const responseStream = new TransformStream()
  const writer = responseStream.writable.getWriter()
  const encoder = new TextEncoder()
  const syncStatusStream = async (notifier: SyncEvents) => {
    notifier.update(
      {
        data: 'Never gonna give you up',
        event: 'update'
      },
      {
        beforeFn: (message) => {
          rickAstleySchema.parse(message.data)
        },
      },
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))
    notifier.update(
      {
        data: 'Never gonna let you down',
        event: 'update'
      },
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))
    notifier.update(
      {
        data: 'Never gonna run around and desert you',
        event: 'update'

      },
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))
    notifier.update(
      {
        data: 'Never gonna make you cry',
        event: 'update'

      },
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))
    notifier.update(
      {
        data: 'Never gonna say goodbye',
        event: 'update'
      },
    )
    await new Promise((resolve) => setTimeout(resolve, 1000))
    notifier.complete(
      {
        data: 'Never gonna tell a lie and hurt you',
        event: 'update'
      },
    )

  }

  syncStatusStream(getSSEWriter(writer, encoder))

  return new NextResponse(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  })
}
