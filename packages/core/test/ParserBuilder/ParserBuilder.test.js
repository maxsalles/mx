import ParserBuilder from '../../src/ParserBuilder/ParserBuilder'

describe('ParserBuilder', () => {
  describe('#match', () => {
    describe('when the "pattern" is a string', () => {
      const expression = ' key: value '
      const pattern = 'key'
      const cassette = new ParserBuilder(expression)
      let result

      beforeAll(() => { result = cassette.match(pattern) })

      test('should return success and the "pattern" value', () => {
        expect(result).toEqual([true, 'key'])
      })

      test('and should advance the "index" to the proper position', () => {
        expect(cassette.index).toBe(4)
      })

      describe('however, the "expression" does not have the "pattern"', () => {
        const expression = ' otherKey: value '
        const cassette = new ParserBuilder(expression)

        beforeAll(() => { result = cassette.match(pattern) })

        test('should return failure', () => {
          expect(result).toEqual([false])
        })

        test('and shuld keep the index unchanged', () => {
          expect(cassette.index).toBe(0)
        })
      })
    })

    describe('when the "pattern" is a RegExp', () => {
      const expression = ' key: value '
      const pattern = /\w+:/
      const cassette = new ParserBuilder(expression)
      let result

      beforeAll(() => { result = cassette.match(pattern) })

      test('should return success and the first value matched with the "pattern"', () => {
        expect(result).toEqual([true, 'key:'])
      })

      test('and should advance the "index" to the proper position', () => {
        expect(cassette.index).toBe(5)
      })

      describe('however, the "expression" does not have the "pattern"', () => {
        const expression = 'key value'
        const cassette = new ParserBuilder(expression)

        beforeAll(() => { result = cassette.match(pattern) })

        test('should return failure', () => {
          expect(result).toEqual([false])
        })

        test('and shuld keep the index unchanged', () => {
          expect(cassette.index).toBe(0)
        })
      })
    })

    describe('when the "handler" is present', () => {
      const expression = ' 12 '
      const data = {}
      const pattern = '12'
      const handler = jest.fn(parseInt)
      const cassette = new ParserBuilder(expression, data)
      let result

      beforeAll(() => { result = cassette.match(pattern, handler) })

      test('should call handlet with the matched string and the "data"', () => {
        expect(handler).toBeCalledWith(pattern, data)
      })

      test('should return success and the "handler" result for the value matched with the "pattern"', () => {
        expect(result).toEqual([true, 12])
      })
    })
  })

  describe('#end', () => {
    test('should return success when what remains to be evaluated are blank characters', () => {
      const expression = ' \n '
      const cassette = new ParserBuilder(expression)
      const result = cassette.end()

      expect(result).toEqual([true])
    })

    test('should return success when there is nothing left to be evaluated', () => {
      const expression = 'expression'
      const cassette = new ParserBuilder(expression)

      cassette.match(expression)

      const result = cassette.end()

      expect(result).toEqual([true])
    })

    test('should return failure when there are still non-white characters to be evaluated', () => {
      const expression = 'expression'
      const cassette = new ParserBuilder(expression)
      const result = cassette.end()

      expect(result).toEqual([false])
    })
  })

  describe('#sequence', () => {
    describe('when all "terms" return success', () => {
      const expression = ' (13, 12 ),'
      const cassette = new ParserBuilder(expression)
      const terms = ['(', /\d+/, ',', cassette => cassette.match(/\d+/), ')']
      let result

      beforeAll(() => { result = cassette.sequence(terms) })

      test('should return success and a list with the matched values', () => {
        expect(result).toEqual([true, ['(', '13', ',', '12', ')']])
      })

      test('and should advance the "index" to the proper position', () => {
        expect(cassette.index).toBe(10)
      })
    })

    describe('when one of the "terms" fails', () => {
      const expression = ' (13, 12,'
      const cassette = new ParserBuilder(expression)
      const terms = ['(', /\d+/, ',', cassette => cassette.match(/\d+/), ')']
      let result

      beforeAll(() => { result = cassette.sequence(terms) })

      test('should return failure', () => {
        expect(result).toEqual([false])
      })

      test('and shuld keep the index unchang', () => {
        expect(cassette.index).toBe(0)
      })
    })

    describe('when the "handler" is presen', () => {
      const expression = '13, 12'
      const data = {}
      const handler = jest.fn(([first, _, second]) => [parseInt(first), parseInt(second)])
      const cassette = new ParserBuilder(expression, data)
      const terms = [/\d+/, ',', /\d+/]
      let result

      beforeAll(() => { result = cassette.sequence(terms, handler) })

      test('should call handlet with the matched strings and the "data"', () => {
        expect(handler).toBeCalledWith(expect.arrayContaining(['13', ',', '12']), data)
      })

      test('should return success and the "handler" result for the value matched with the "pattern"', () => {
        expect(result).toEqual([true, [13, 12]])
      })
    })
  })

  describe('#option', () => {
    describe('when at least one of the "terms" returns success', () => {
      const expression = ' 12 '
      const cassette = new ParserBuilder(expression)
      const terms = ['13', /\d+/, cassette => cassette.match('12')]
      let result

      beforeAll(() => { result = cassette.option(terms) })

      test('should return success and the matched value', () => {
        expect(result).toEqual([true, '12'])
      })

      test('and should advance the "index" to the proper position', () => {
        expect(cassette.index).toBe(3)
      })
    })

    describe('when all "terms" fails', () => {
      const expression = ' 12 '
      const cassette = new ParserBuilder(expression)
      const terms = ['13', /[a-z]+/, cassette => cassette.match('21')]
      let result

      beforeAll(() => { result = cassette.option(terms) })

      test('should return failure', () => {
        expect(result).toEqual([false])
      })

      test('and shuld keep the index unchang', () => {
        expect(cassette.index).toBe(0)
      })
    })

    describe('when the "handler" is presen', () => {
      const expression = ' 12 '
      const data = {}
      const cassette = new ParserBuilder(expression, data)
      const handler = jest.fn(parseInt)
      const terms = ['13', cassette => cassette.match('12'), /\d+/]
      let result

      beforeAll(() => { result = cassette.option(terms, handler) })

      test('should call handlet with the matched string and the "data"', () => {
        expect(handler).toBeCalledWith('12', data)
      })

      test('should return success and the "handler" result for the value matched with the "pattern"', () => {
        expect(result).toEqual([true, 12])
      })
    })
  })

  describe('#repetition', () => {
    const examples = [
      {
        type: 'string',
        successTerm: '1',
        failureTerm: 'a'
      },
      {
        type: 'RegExp',
        successTerm: /\d+/,
        failureTerm: /[a-z]+/
      },
      {
        type: 'function',
        successTerm: cassette => cassette.match('1'),
        failureTerm: cassette => cassette.match('a')
      }
    ]

    describe.each(examples)('when the "term" is a $type', ({ successTerm, failureTerm }) => {
      const expression = ' 1 1 1 1 1 a '
      const cassette = new ParserBuilder(expression)
      let result

      beforeAll(() => { result = cassette.repetition(successTerm) })

      test('should return success and the matched value', () => {
        expect(result).toEqual([true, ['1', '1', '1', '1', '1']])
      })

      test('and should advance the "index" to the proper position', () => {
        expect(cassette.index).toBe(10)
      })

      describe('however, the "expression" does not match the "term"', () => {
        const cassette = new ParserBuilder(expression)

        beforeAll(() => { result = cassette.repetition(failureTerm) })

        test('should return success and an empty list', () => {
          expect(result).toEqual([true, []])
        })

        test('and shuld keep the index unchanged', () => {
          expect(cassette.index).toBe(0)
        })
      })
    })

    describe('when the "handler" is present', () => {
      const expression = ' 1 2 3 4 5 '
      const data = {}
      const cassette = new ParserBuilder(expression, data)
      const handler = jest.fn(values => values.reduce((acc, value) => acc + parseInt(value), 0))
      const terms = /\d+/
      let result

      beforeAll(() => { result = cassette.repetition(terms, handler) })

      test('should call handlet with the matched strings and the "data"', () => {
        expect(handler).toBeCalledWith(expect.arrayContaining(['1', '2', '3', '4', '5']), data)
      })

      test('should return success and the "handler" result for the value matched with the "pattern"', () => {
        expect(result).toEqual([true, 15])
      })
    })
  })
})
