import { ResponseError } from '@jabba01/tuba-api-client-aio'

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
export const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const getRandomEntry = (array: any[]): any => {
  return array[getRandomInt(0, array.length - 1)]
}

export const extractErrorMsg = async (
  err: any,
): Promise<{ errMsg: string; respBody: any }> => {
  let respBody
  try {
    respBody = await err.response?.json()
  } catch (e) {
    respBody = undefined
  }
  return {
    errMsg:
      err instanceof ResponseError && err.response
        ? err.response.status +
          ' -> ' +
          JSON.stringify(respBody) +
          ' \nError: ' +
          err
        : err.stack
          ? err.stack
          : err,
    respBody,
  }
}
