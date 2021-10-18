import parsePath from '../../src/utils/parsePath'

describe('parsePath', () => {
  const examples = [
    [undefined, []],
    [
      'property.otherProperty[0].anotherProperty',
      ['property', 'otherProperty', '0', 'anotherProperty']
    ],
    ['[0][12].anotherProperty', ['0', '12', 'anotherProperty']],
    [
      '.property.otherProperty[0].anotherProperty',
      ['property', 'otherProperty', '0', 'anotherProperty']
    ],
    [
      '[property]otherProperty[0].anotherProperty',
      ['property', 'otherProperty', '0', 'anotherProperty']
    ],
    [
      '[[property]]..otherProperty[0].[anotherProperty]',
      ['property', 'otherProperty', '0', 'anotherProperty']
    ]
  ]

  test.each(examples)('should parse %s as "%s"', (path, result) => {
    expect(parsePath(path)).toEqual(result)
  })

  describe('when the "path" is an "Array"', () => {
    test('should return the "path"', () => {
      const path = ['property', 'otherProperty']

      expect(parsePath(path)).toBe(path)
    })
  })
})
