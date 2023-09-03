import { Writer, getSSEWriter } from './writer'
import * as utils from './utils'

describe('Writer class', () => {
  let mockWriter: any
  let mockEncoder: any
  let writerInstance: Writer
  let toDataStringSpy: jest.SpyInstance

  beforeEach(() => {
    mockWriter = {
      write: jest.fn(),
      close: jest.fn(),
    }
    mockEncoder = {
      encode: jest.fn((str: string) => str),
    }
    writerInstance = new Writer(mockWriter, mockEncoder)
    toDataStringSpy = jest.spyOn<any, any>(utils, 'toDataString')
  })

  describe('update', () => {
    it('should handle without customFn', () => {
      const mockMessage = { data: 'testData' }
      writerInstance.update(mockMessage)
      expect(toDataStringSpy).toHaveBeenCalledWith(mockMessage.data)
      expect(mockWriter.write).toHaveBeenCalled()
    })

    it('should handle with customFn', () => {
      const customFn = jest.fn()
      const mockMessage = { data: 'testData' }
      writerInstance.update(mockMessage, customFn)
      expect(customFn).toHaveBeenCalledWith(mockMessage.data)
    })
  })

  describe('complete', () => {
    it('should handle without customFn', () => {
      const mockMessage = { data: 'testData' }
      writerInstance.complete(mockMessage)
      expect(toDataStringSpy).toHaveBeenCalledWith(mockMessage.data)
      expect(mockWriter.write).toHaveBeenCalled()
      expect(mockWriter.close).toHaveBeenCalled()
    })

    it('should handle with customFn', () => {
      const customFn = jest.fn()
      const mockMessage = { data: 'testData' }
      writerInstance.complete(mockMessage, customFn)
      expect(customFn).toHaveBeenCalledWith(mockMessage)
    })
  })

  describe('error', () => {
    it('should handle without customFn', () => {
      const mockMessage = { data: 'testError' }
      writerInstance.error(mockMessage)
      expect(toDataStringSpy).toHaveBeenCalledWith(mockMessage.data)
      expect(mockWriter.write).toHaveBeenCalled()
      expect(mockWriter.close).toHaveBeenCalled()
    })

    it('should handle with customFn', () => {
      const customFn = jest.fn()
      const mockMessage = { data: 'testError' }
      writerInstance.error(mockMessage, customFn)
      expect(customFn).toHaveBeenCalledWith(mockMessage)
    })
  })

  describe('close', () => {
    it('should handle without customFn', () => {
      const mockData = 'closeData'
      writerInstance.close(mockData)
      expect(mockWriter.close).toHaveBeenCalled()
    })

    it('should handle with customFn', () => {
      const customFn = jest.fn()
      const mockData = 'closeData'
      writerInstance.close(mockData, customFn)
      expect(customFn).toHaveBeenCalledWith(mockData)
    })
  })

  describe('writeMessage', () => {
    const fullMessage = {
      data: 'data',
      comment: 'comment',
      event: 'event',
      id: '1',
      retry: 5,
    }

    it('should write full message', () => {
      writerInstance.writeMessage(mockWriter, mockEncoder, fullMessage)
      expect(mockEncoder.encode).toHaveBeenCalledWith(
        `: ${fullMessage.comment}\n`
      )
      expect(mockEncoder.encode).toHaveBeenCalledWith(
        `event: ${fullMessage.event}\n`
      )
      expect(mockEncoder.encode).toHaveBeenCalledWith(`id: ${fullMessage.id}\n`)
      expect(mockEncoder.encode).toHaveBeenCalledWith(
        `retry: ${fullMessage.retry}\n`
      )
      expect(toDataStringSpy).toHaveBeenCalledWith(fullMessage.data)
    })

    it('should write message without comment', () => {
      const messageWithoutComment = { ...fullMessage, comment: undefined }
      delete messageWithoutComment.comment
      writerInstance.writeMessage(
        mockWriter,
        mockEncoder,
        messageWithoutComment
      )
      expect(mockEncoder.encode).not.toHaveBeenCalledWith(
        `: ${fullMessage.comment}\n`
      )
    })

    it('should write message without event', () => {
      const messageWithoutEvent = { ...fullMessage, event: undefined }
      delete messageWithoutEvent.event
      writerInstance.writeMessage(mockWriter, mockEncoder, messageWithoutEvent)
      expect(mockEncoder.encode).not.toHaveBeenCalledWith(
        `event: ${fullMessage.event}\n`
      )
    })

    it('should write message without id', () => {
      const messageWithoutId = { ...fullMessage, id: undefined }
      delete messageWithoutId.id
      writerInstance.writeMessage(mockWriter, mockEncoder, messageWithoutId)
      expect(mockEncoder.encode).not.toHaveBeenCalledWith(
        `id: ${fullMessage.id}\n`
      )
    })

    it('should write message without retry', () => {
      const messageWithoutRetry = { ...fullMessage, retry: undefined }
      writerInstance.writeMessage(mockWriter, mockEncoder, messageWithoutRetry)
      expect(mockEncoder.encode).not.toHaveBeenCalledWith(
        `retry: ${fullMessage.retry}\n`
      )
    })

    it('should write message without comment', () => {
      const messageWithoutComment = { ...fullMessage, comment: undefined }
      delete messageWithoutComment.comment
      writerInstance.writeMessage(
        mockWriter,
        mockEncoder,
        messageWithoutComment
      )
      expect(mockEncoder.encode).not.toHaveBeenCalledWith(
        `: ${fullMessage.comment}\n`
      )
    })
  })

  describe('getSSEWriter', () => {
    it('should return an instance of Writer', () => {
      const instance = getSSEWriter(mockWriter, mockEncoder)
      expect(instance).toBeInstanceOf(Writer)
    })
  })
})
