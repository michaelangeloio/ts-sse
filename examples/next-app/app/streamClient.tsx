'use client'
import {
  useEffect,
  useState,
  createContext,
  ReactNode,
  useContext,
  useCallback,
} from 'react'
import { rickAstleySchema } from './stream/types'

// Create a context
const EventSourceContext = createContext<null | EventSource>(null)

export const EventSourceProvider = ({ children }: { children: ReactNode }) => {
  const [eventSource, setEventSource] = useState<null | EventSource>(null)

  useEffect(() => {
    const source = new EventSource('http://localhost:3000/stream', {
      withCredentials: true,
    })
    setEventSource(source)

    return () => {
      source.close()
    }
  }, [])

  return (
    <EventSourceContext.Provider value={eventSource}>
      {children}
    </EventSourceContext.Provider>
  )
}

const StreamClient = () => {
  const [lyric, setLyric] = useState<string>('')

  const eventSource = useContext(EventSourceContext)
  const updateLyric = useCallback((event: MessageEvent) => {
    const parsed = rickAstleySchema.safeParse(event.data)
    if (parsed.success) {
      setLyric(parsed.data)
      if (parsed.data === 'fin') {
        eventSource?.close()
      }
    }
  }, [])

  useEffect(() => {
    if (eventSource) {
      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error)
      }
      eventSource.addEventListener('update', updateLyric)

      return () => {
        eventSource.removeEventListener('update', updateLyric)
      }
    }
  }, [eventSource])

  return lyric
}

const StreamClientComponent = () => {
  const lyric = StreamClient()
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh]">
      <h1 className="text-6xl font-bold text-center">{lyric}</h1>
    </div>
  )
}

const StreamClientComponentWithProvider = () => {
  return (
    <EventSourceProvider>
      <StreamClientComponent />
    </EventSourceProvider>
  )
}

export default StreamClientComponentWithProvider
