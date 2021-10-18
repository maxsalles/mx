import { escapeRegExp } from '../utils'

const PRIVATE = Symbol('private')
const identity = value => value

export default class ParserBuilder {
  constructor (expression, data) {
    Object.defineProperty(this, PRIVATE, {
      value: {
        expression,
        data,
        index: 0
      },
      writable: true
    })
  }

  get index () {
    return this[PRIVATE].index
  }

  match (pattern, handler = identity) {
    const expression = this[PRIVATE].expression.substring(this.index)

    const regex = new RegExp(
      `^\\s*${pattern instanceof RegExp ? pattern.source : escapeRegExp(pattern)}`
    )

    const [result] = expression.match(regex) || []

    if (!result) return [false]

    const value = handler(result.trim(), this[PRIVATE].data)

    this[PRIVATE].index = this[PRIVATE].index + result.length

    return [true, value]
  }

  end () {
    return [
      (this[PRIVATE].expression.length === this.index) || this.match(/$/)[0]
    ]
  }

  sequence (terms, handler = identity) {
    const saved = this[PRIVATE].index
    const values = []

    for (const term of terms) {
      const [success, value] = typeof term === 'string' || term instanceof RegExp
        ? this.match(term)
        : term(this)

      if (!success) {
        this[PRIVATE].index = saved

        return [false]
      }

      values.push(value)
    }

    return [true, handler(values, this[PRIVATE].data)]
  }

  option (terms, handler = identity) {
    const saved = this[PRIVATE].index

    for (const term of terms) {
      const [success, value] = typeof term === 'string' || term instanceof RegExp
        ? this.match(term)
        : term(this)

      if (success) return [true, handler(value, this[PRIVATE].data)]
    }

    this[PRIVATE].index = saved

    return [false]
  }

  repetition (term, handler = identity) {
    const values = []
    const perform = typeof term === 'string' || term instanceof RegExp
      ? cassette => cassette.match(term)
      : term

    for (;;) {
      const [success, value] = perform(this)

      if (!success) break

      values.push(value)
    }

    return [true, handler(values, this[PRIVATE].data)]
  }
}
