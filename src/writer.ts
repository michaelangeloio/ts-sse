import { toDataString } from './utils'

export interface Message<T = string | Record<string, unknown>> {
  data: T
  comment?: string
  event?: string
  id?: string
  retry?: number
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
  update: (message: Message<T['update']>['data'], customFn?: CustomFn) => void
  complete: (
    message: Message<T['complete']>['data'],
    customFn?: CustomFn
  ) => void
  error: (message: Message<T['error']>['data'], customFn?: CustomFn) => void
  close: (message: Message<T['close']>['data'], customFn?: CustomFn) => void
}

type CustomFn = (any: unknown) => unknown

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

  update(message: any, customFn?: CustomFn) {
    if (customFn) {
      customFn(message.data)
    }
    this.writeMessage(this.writer, this.encoder, message)
  }

  complete(message: any, customFn?: CustomFn) {
    if (customFn) {
      customFn(message)
    }
    this.writeMessage(this.writer, this.encoder, message)
    void this.writer.close()
  }

  error(message: any, customFn?: CustomFn) {
    if (customFn) {
      customFn(message)
    }
    this.writeMessage(this.writer, this.encoder, message)
    void this.writer.close()
  }

  close(data: any, customFn?: CustomFn) {
    if (customFn) {
      customFn(data)
    }
    void this.writer.close()
  }
}

export const getSSEWriter = (
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder
) => new Writer(writer, encoder)
