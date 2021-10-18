export default class BaseError extends Error {
  constructor (message, ...rest) {
    super(message, ...rest)
  }

  get name () {
    return 'BaseError'
  }
}
