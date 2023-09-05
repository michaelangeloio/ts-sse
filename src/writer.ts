import { toDataString } from './utils'

export interface Message<T = string | Record<string, unknown>> {
  data: T
  comment?: string
  event?: string
  id?: string
  retry?: number
}

export interface Message<T = string | Record<string, unknown>> {
  data: T
  comment?: string
  event?: string
  id?: string
  retry?: number
}
export type EventOptions<T = string | Record<string, unknown>> = {
  beforeFn?: CustomFn<T>
  afterFn?: CustomFn<T>
}

export interface EventNotifier<
  T extends {
    update: T['update'] extends Message ? Message<T['update']>['data'] : never
    complete: T['complete'] extends Message
      ? Message<T['complete']>['data']
      : never
    error: T['error'] extends Message ? Message<T['error']>['data'] : never
    close: T['close'] extends Message ? Message<T['close']>['data'] : never
  } = any
> {
  update: (
    message: Message<T['update']>['data'],
    opts?: EventOptions<Message<T['update']>['data']>
  ) => void
  complete: (
    message: Message<T['complete']>['data'],
    opts?: EventOptions<Message<T['complete']>['data']>
  ) => void
  error: (
    message: Message<T['error']>['data'],
    opts?: EventOptions<Message<T['error']>['data']>
  ) => void
  close: (
    message: Message<T['close']>['data'],
    opts?: EventOptions<Message<T['close']>['data']>
  ) => void
}

type CustomFn<T = string | Record<string, unknown>> = (data: T) => unknown

export class Writer implements EventNotifier {
  constructor(
    readonly writer: WritableStreamDefaultWriter,
    readonly encoder: TextEncoder
  ) {}

  writeMessage(
    writer: WritableStreamDefaultWriter,
    encoder: TextEncoder,
    message: Message
  ): void {
    if (message.comment) {
      void writer.write(encoder.encode(`: ${message.comment}\n`))
    }
    if (message.event) {
      void writer.write(encoder.encode(`event: ${message.event}\n`))
    }
    if (message.id) {
      void writer.write(encoder.encode(`id: ${message.id}\n`))
    }
    if (message.retry) {
      void writer.write(encoder.encode(`retry: ${message.retry}\n`))
    }
    if (message.data) {
      void writer.write(encoder.encode(toDataString(message.data)))
    }
  }

  update(message: Message, opts?: EventOptions<any>) {
    if (opts?.beforeFn) {
      opts.beforeFn(message)
    }
    this.writeMessage(this.writer, this.encoder, message)
    if (opts?.afterFn) {
      opts.afterFn(message)
    }
  }

  complete(message: Message, opts?: EventOptions<any>) {
    if (opts?.beforeFn) {
      opts.beforeFn(message)
    }
    this.writeMessage(this.writer, this.encoder, message)
    void this.writer.close()
    if (opts?.afterFn) {
      opts.afterFn(message)
    }
  }

  error(message: Message, opts?: EventOptions<any>) {
    if (opts?.beforeFn) {
      opts.beforeFn(message)
    }
    this.writeMessage(this.writer, this.encoder, message)
    if (opts?.afterFn) {
      opts.afterFn(message)
    }
    void this.writer.close()
  }

  close(message: Message, opts?: EventOptions<any>) {
    if (opts?.beforeFn) {
      opts.beforeFn(message.data)
    }
    if (opts?.afterFn) {
      opts.afterFn(message.data)
    }
    void this.writer.close()
  }
}

export const getSSEWriter = (
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) => new Writer(writer, encoder)
