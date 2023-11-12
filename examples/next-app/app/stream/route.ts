import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { EventNotifier, getSSEWriter } from 'ts-sse'
import { rickAstleySchema } from './types'

export const dynamic = 'force-dynamic'

type SyncEvents = EventNotifier<{
  update: {
    data: z.infer<typeof rickAstleySchema>
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

export async function GET(request: NextRequest) {
  const responseStream = new TransformStream()
  const writer = responseStream.writable.getWriter()
  const encoder = new TextEncoder()
  let abort = false

  request.signal.onabort = () => {
    abort = true
    writer.close()
  }

  const beforeFn = (message: { data: string; event: 'update' }) => {
    rickAstleySchema.parse(message.data)
    if (abort) {
      throw new Error('Abort!')
    }
  }

  const messages = [
    'Never gonna give you up',
    'Never gonna let you down',
    'Never gonna run around and desert you',
    'Never gonna make you cry',
    'Never gonna say goodbye',
    'Never gonna tell a lie and hurt you',
    'fin',
  ]
  const syncStatusStream = async (notifier: SyncEvents) => {
    for (const message of messages) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      notifier.update({ data: message, event: 'update' }, { beforeFn })
    }
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
