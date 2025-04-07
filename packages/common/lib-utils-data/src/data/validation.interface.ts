import { IConflict, IException } from '.'

/**
 * Result of a sale validation operation
 */
export interface IValidationReport {
  /** List of conflicts met during the validation process */
  conflict?: IConflict[]

  /** List of errors raised during the validation process */
  error?: IException[]
}
