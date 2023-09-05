/* eslint-disable @typescript-eslint/no-empty-function */
import { isNil, isObject, isUndefined, toDataString } from './utils' // replace with your actual file name

describe('Utility functions', () => {
  describe('isNil', () => {
    it('should return true for undefined', () => {
      expect(isNil(undefined)).toBeTruthy()
    })

    it('should return true for null', () => {
      expect(isNil(null)).toBeTruthy()
    })

    it('should return false for other values', () => {
      expect(isNil('')).toBeFalsy()
      expect(isNil(0)).toBeFalsy()
      expect(isNil([])).toBeFalsy()
      expect(isNil({})).toBeFalsy()
      expect(isNil(() => {})).toBeFalsy()
    })
  })

  describe('isObject', () => {
    it('should return true for object literals', () => {
      expect(isObject({})).toBeTruthy()
      expect(isObject({ a: 1 })).toBeTruthy()
    })

    it('should return false for non-objects', () => {
      expect(isObject(null)).toBeFalsy()
      expect(isObject(undefined)).toBeFalsy()
      expect(isObject('string')).toBeFalsy()
      expect(isObject(1)).toBeFalsy()
    })
  })

  describe('isUndefined', () => {
    it('should return true for undefined', () => {
      expect(isUndefined(undefined)).toBeTruthy()
    })

    it('should return false for other values', () => {
      expect(isUndefined(null)).toBeFalsy()
      expect(isUndefined('')).toBeFalsy()
      expect(isUndefined(0)).toBeFalsy()
      expect(isUndefined([])).toBeFalsy()
      expect(isUndefined({})).toBeFalsy()
      expect(isUndefined(() => {})).toBeFalsy()
    })
  })

  describe('toDataString', () => {
    it('should process string correctly', () => {
      const input = 'Hello\nWorld\r\nHow\rAre You'
      const output = 'data: Hello\ndata: World\ndata: How\ndata: Are You\n'
      expect(toDataString(input)).toBe(output)
    })

    it('should process object correctly', () => {
      const input = { a: 1, b: 'string' }
      const output = 'data: {"a":1,"b":"string"}\n'
      expect(toDataString(input)).toBe(output)
    })
  })
})
