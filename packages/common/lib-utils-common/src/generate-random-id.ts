import crypto from 'crypto'

/**
 * Generate a random ID number
 * @param length The length of the ID to generate
 * @returns random number
 */
export const generateRandomId = (length = 9): number => {
  if (length < 1 || length > 16)
    throw new Error(`generateRandomId: Length must be between 1 and 16 inclusive`)

  const randomBytes = crypto.randomBytes(8)
  const randomNumber = randomBytes.readBigUInt64BE(0)

  return Number(randomNumber.toString().padStart(20, '0').slice(-length))
}

export const generateUserNameFromEmail = (email: string): string => {
  if (!email) return undefined
  const emailSplit = email.split('@')
  const emailName = emailSplit[0].split('.')[1]
    ? emailSplit[0].split('.')[0]
    : emailSplit[0]
  const randomNb = generateRandomId(4)
  return `${emailName}_${randomNb}`
}

export const generateUserHandle = (name: string): string => {
  if (!(name?.length > 3))
    throw new Error(
      `generateUserHandle: User name must be at least 4 characters long`,
    )

  const simpleName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  const randomNb = generateRandomId(6)
  return `${simpleName}#${randomNb}`
}
