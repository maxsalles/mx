import BaseError from './BaseError'

export default class NotImplementedError extends BaseError {
  constructor (methodName, ...args) {
    super(`${methodName} is not implemented`, ...args)
  }

  get name () {
    return 'NotImplementedError'
  }
}
