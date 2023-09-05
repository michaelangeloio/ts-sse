'use client'
import { useEffect, useState } from "react"
import { z } from "zod"
import { rickAstleySchema } from "./stream/types"

export const StreamClient = () => {
  const [lyric, setLyric] = useState<string>("")
  const source = new EventSource("http://localhost:3000/stream")
  useEffect(() => {
    source.addEventListener('update', (event) => {
      const parsed = rickAstleySchema.safeParse(event.data)
      if (parsed.success) {
        setLyric(parsed.data)
      }
    })
  }, [])
  return lyric
}