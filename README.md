# ts-sse 

utilities for Server Sent Events that adopts the [HTML Spec Standard](https://html.spec.whatwg.org/multipage/server-sent-events.html) for the [EventSource Web API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). 

## Background

This is a TypeScript implementation of the [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events) specification. This is to make sending Event Source streams easier to implement on the server side.

It's a lightweight wrapper around the Web API specification. It's not a polyfill. It's not a replacement. It's just a simple wrapper around [Streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) according to the [HTML Spec Standard](https://html.spec.whatwg.org/multipage/server-sent-events.html).

> ❗ This is not to be confused with Node's [Stream API](https://nodejs.org/api/stream.html). This is a wrapper around the [Web Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API) which is also newly available in [Node 20 and above](https://nodejs.org/api/webstreams.html).

> For example, this utility accepts a [`WritableStreamDefaultWriter`](https://nodejs.org/api/webstreams.html#class-writablestreamdefaultwriter) and not a [`stream.Writable`](https://nodejs.org/api/stream.html#class-streamwritable).

This lib is **actually small enough to be a gist or directly copy pasta**. You can go to `writer.ts` and copy the code directly if you'd like.

## Acknowledgements

This borrows from [`node-ssestream`](https://github.com/EventSource/node-ssestream/tree/master) and also Nestjs's [`sse`](https://github.com/nestjs/nest/blob/069b519a1c9f040e9a4ec273b422f15cd95d3844/packages/core/router/sse-stream.ts) implementation. 

##  Getting Started with ts-sse (TypeScript Server-Sent Events)

```bash
npm install ts-sse
```

### Prerequisites
- have TypeScript.
- A basic understanding of [Server-Sent Events "SSE"](https://html.spec.whatwg.org/multipage/server-sent-events.html) and the [EventSource Web API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource).


### Nextjs Example

Go to the [examples/next-app](./examples/next-app) directory for a full example.

> the streaming route is at `/stream/route.tsx` and the client component is at `/StreamClient.tsx`


> This wrapper is compatible with any server/runtime that can return a `responseStream.readable`. Below is an example with Nextjs that implements a "syncing" streaming route.

#### Import the Utilities
```ts
import { EventNotifier, getSSEWriter } from 'ts-sse'
```

#### Define Your Message Schema
Before you can send events, you need to define the `data` structure of the messages you'll be sending. This example uses zod, but you can just use pure TS too.

```ts
import { z } from 'zod';

const syncSchema = z.object({
  sync_status: z.enum(['begin_stream', 'error', 'sync_update', 'sync_complete']),
  sync_message: z.string(),
  sync_date: z.string(),
});

```

#### Define Your Event Types
```ts
//api/stream/types.ts
type SyncEvents = EventNotifier<{
  update: {
    data: z.infer<typeof syncSchema>
    comment: string
  }
  complete: {
    data: z.infer<typeof syncSchema>
    event: 'some_event' | 'some_other_event'
  }
  close: {
    data: never
  }
  error: {
    data: never
  }
}>;
```

The `EventNotifier` is a generic type that takes in an object of event types: `update`, `complete`, `close`, and `error`.

These event types take the following properties:

- `data`: The main content of the message. It can be a string or an object.
- `comment` (optional)
- `event` (optional)
- `id` (optional)
- `retry` (optional)

> these properties follow properties outlined in the HTML Spec Standard for [Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html). Search "process the field".

#### Create Your SSE Stream
Now, let's dive into some Next! Create a function that will handle the SSE logic:

```ts
// api/stream/route.ts
import { EventNotifier, getSSEWriter } from 'ts-sse'
import { syncSchema, SyncEvents } from './types'

export async function GET() {
  // ... (authentication and other logic)

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const syncStatusStream = async (notifier: SyncEvents) => {
    // Begin the stream
    notifier.update({
      data: {
        sync_status: 'begin_stream',
      },
    });

    // ... (your logic for fetching data and sending updates)

    // Example: Sending a sync update
    notifier.update({
      data: {
        sync_status: 'sync_update',
        sync_date: 'your-date-here',
        sync_message: 'Syncing...',
      },
    });

    // ... (more logic, handling errors, completion, etc.)
  };

  // Use the getSSEWriter to initialize the utility with the writer
  syncStatusStream(getSSEWriter(writer, encoder)); // 👈 inject encoder and writer into `getSSEWriter` factory

  // Return the response stream
  return new NextResponse(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}

```

If you need to close the connection, you can call either `close`, `complete`, or `error` on the `notifier` object.

```ts
// api/stream/route.ts

// ... (your logic for fetching data and sending updates)
  notifier.complete({
  data: {
    sync_status: 'sync_complete',
    sync_date: 'your-date-here',
    sync_message: `I'm done!`,
  },
  });
```

If you want to run some custom behavior before or after the event is sent, you can pass in a callback to the `update` method for example.

```ts
// api/stream/route.ts

// ... (your logic for fetching data and sending updates)
notifier.update(
  {
    data: {
      eventType: 'begin_stream',
    },
  },
  {
    beforeFn: (message) => {
      syncSchema.parse(message.data)
    },
  },
)
```



### Client Side

You can use the [EventSource Web API](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) to consume the stream.

```tsx
'use client'
// some-component.tsx

const SomeComponent = () => {
  const [syncStatus, setSyncStatus] = useState<SyncEvents['update']['data']>('begin_stream');

  useEffect(() => {
    const eventSource = new EventSource('/api/stream/route');
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as SyncEvents['update']['data'];
      setSyncStatus(data.sync_status);
    };
    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <p>Sync Status: {syncStatus}</p>
    </div>
  );
};
```

## API

See here for the full API: [API.md](./docs/api.md)
