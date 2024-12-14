import parseValue from '../../src/AttributeHandler/parseValue'

describe('parseValue', () => {
  const resources = {
    attr: {
      subAttr1: {
        attr: 'some value'
      },
      subAttr2: [1, 2, {
        attr: 'some value',
        subAttr: [10]
      }]
    }
  }

  const basePath = ['attr', 'subAttr2', '2']

  describe('when the "string" is recognized as a valid expression', () => {
    const examples = [
      ["'some string'", 'some string'],
      ['"some string"', 'some string'],
      ['"some\nstring"', 'some\nstring'],
      ['true', true],
      ['false', false],
      ['0', 0],
      ['1', 1],
      ['12', 12],
      ['100', 100],
      ['-1', -1],
      ['-12', -12],
      ['-100', -100],
      ['0.1', 0.1],
      ['0.2', 0.2],
      ['0.01', 0.01],
      ['-0.1', -0.1],
      ['-0.2', -0.2],
      ['-0.01', -0.01],
      ['1E3', 1E3],
      ['2e6', 2e6],
      ['0.1e2', 0.1e2],
      ['-1E3', -1E3],
      ['-2e6', -2e6],
      ['-0.1e2', -0.1e2],
      ['1995-12-17T03:24:00', new Date('1995-12-17T03:24:00')],
      ['1996-10-13T08:35:32.000Z', new Date('1996-10-13T08:35:32.000Z')],
      ['/attr/subAttr2/1', resources.attr.subAttr2[1]],
      ['~subAttr/0', resources.attr.subAttr2[2].subAttr[0]],
      ['/somePath1/0/path', undefined],
      ['~somePath1/0/path', undefined],
      [
        '[0, 10, -0.1e2, "some\nstring", 1995-12-17T03:24:00, ~subAttr/0]',
        [0, 10, -0.1e2, 'some\nstring', new Date('1995-12-17T03:24:00'), resources.attr.subAttr2[2].subAttr[0]]
      ],
      [
        "[0, 10, [-0.1e2, 'some\nstring', [1996-10-13T08:35:32.000Z]], ~subAttr/0]",
        [0, 10, [-0.1e2, 'some\nstring', [new Date('1996-10-13T08:35:32.000Z')]], resources.attr.subAttr2[2].subAttr[0]]
      ],
      [
        '{ key: 0, otherKey: 10, another_key: "some\nstring", date1: 1995-12-17T03:24:00, __path__: ~subAttr/0 }',
        {
          key: 0,
          otherKey: 10,
          another_key: 'some\nstring',
          date1: new Date('1995-12-17T03:24:00'),
          __path__: resources.attr.subAttr2[2].subAttr[0]
        }
      ],
      [
        '{ key: -0.1e2, otherKey: { str: "some\nstring", date: { value: 1995-12-17T03:24:00 } }, _path: ~subAttr/0 }',
        {
          key: -0.1e2,
          otherKey: {
            str: 'some\nstring',
            date: {
              value: new Date('1995-12-17T03:24:00')
            }
          },
          _path: resources.attr.subAttr2[2].subAttr[0]
        }
      ],
      [
        '["some\nstring", { key: { otherKey: [/attr/subAttr2/1, 1996-10-13T08:35:32.000Z, -0.1e2] } }, true, false]',
        [
          'some\nstring',
          {
            key: {
              otherKey: [
                resources.attr.subAttr2[1],
                new Date('1996-10-13T08:35:32.000Z'),
                -0.1e2
              ]
            }
          },
          true,
          false
        ]
      ],
      [
        '{ key: -0.1E2, otherKey: [" some string ", true, false, [1995-12-17T03:24:00]], _path: /attr/subAttr2/1 }',
        {
          key: -0.1e2,
          otherKey: [' some string ', true, false, [new Date('1995-12-17T03:24:00')]],
          _path: resources.attr.subAttr2[1]
        }
      ],
      [
        "0, 10, [-0.1e2, 'some\nstring', [1996-10-13T08:35:32.000Z]], /attr/subAttr2/1",
        [0, 10, [-0.1e2, 'some\nstring', [new Date('1996-10-13T08:35:32.000Z')]], resources.attr.subAttr2[1]]
      ],
      [
        'key: 0, otherKey: 10, another_key: { value: "some\nstring", date1: 1995-12-17T03:24:00 }, __path__: /attr/subAttr2/1',
        {
          key: 0,
          otherKey: 10,
          another_key: {
            value: 'some\nstring',
            date1: new Date('1995-12-17T03:24:00')
          },
          __path__: resources.attr.subAttr2[1]
        }
      ],
    ]

    test.each(examples)('should parse `%s` properly', (string, result) => {
      expect(parseValue(string, resources, basePath)).toEqual(result)
    })
  })

  describe('when the "string" is not recognized as a valid expression', () => {
    const examples = [
      '"some stirng" "another string"',
      "'some\nstring' 10",
      '{ key: 10, 100 }',
      '[10, true, ~/some/path]',
      '~some/_path/1',
      '20, key: 200',
      '1995-12-17T03:24:00 true'
    ]

    test.each(examples)('when processing %s, it should return the "string" itself', string => {
      expect(parseValue(string, resources, basePath)).toBe(string)
    })
  })
})
