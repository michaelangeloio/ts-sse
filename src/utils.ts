export const isNil = (val: any): val is null | undefined =>
  isUndefined(val) || val === null

export const isObject = (fn: any): fn is Record<string, unknown> =>
  !isNil(fn) && typeof fn === 'object'

/* eslint-disable @typescript-eslint/no-use-before-define */
export const isUndefined = (obj: any): obj is undefined =>
  typeof obj === 'undefined'

export function toDataString(data: string | Record<string, unknown>): string {
  if (isObject(data)) {
    return toDataString(JSON.stringify(data))
  }

  return data
    .split(/\r\n|\r|\n/)
    .map((line) => `data: ${line}\n`)
    .join('')
}
