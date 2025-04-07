import { CustomDecorator, SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const ALLOW_UNAUTHENTICATED = 'allowUnauthenticated'

// decorators
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true)
export const AllowUnauthenticated = () => SetMetadata(ALLOW_UNAUTHENTICATED, true)
