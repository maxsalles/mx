/**
 * @jest-environment jsdom
 */

import AttributeHandler from '../../src/AttributeHandler/AttributeHandler'

describe('AttributeHandler', () => {
  const prefix = 'app'
  const aspectName = 'aspect'
  const defaultOption = 'default'
  let element, handler

  const setup = ({
    prefix,
    aspectName,
    defaultOption,
    resources,
    basePath,
    HTML = ''
  }) => {
    document.body.innerHTML = HTML

    handler = new AttributeHandler(prefix, aspectName, defaultOption, resources, basePath)
    element = document.body.querySelector('#element')
  }

  afterEach(() => document.body.innerHTML = '')

  describe('#base', () => {
    beforeEach(() => setup({ prefix, aspectName }))

    test('should return a composition of the "prefix" and "aspectName"', () => {
      expect(handler.base).toBe(`${prefix}:${aspectName}`)
    })
  })

  describe('#attributesFrom(element)', () => {
    beforeEach(() => setup({
      prefix,
      aspectName,
      defaultOption,
      HTML: `
      <input
        id="element"
        ${aspectName}="value"
        xm:aspect="some value"
        ${prefix}:other-aspect="other value"
        ${prefix}:${aspectName}="another value"
        ${prefix}:${aspectName}:option="some another value" >
      `
    }))

    test('should return an object with the attributes and their values', () => {
      expect(handler.attributesFrom(element)).toEqual({
        [`${prefix}:${aspectName}`]: 'another value',
        [`${prefix}:${aspectName}:option`]: 'some another value'
      })
    })
  })

  describe('#pathTo(attribute)', () => {
    beforeEach(() => setup({ prefix, aspectName, defaultOption }))

    const examples = [
      [`${prefix}:${aspectName}`, []],
      [`${prefix}:${aspectName}:attribute`, ['attribute']],
      [`${prefix}:${aspectName}:attribute:attribute`, ['attribute', 'attribute']],
      [`${prefix}:${aspectName}:attribute:other-attribute`, ['attribute', 'otherAttribute']],
    ]

    test.each(examples)(
      'for "%s", should return %p',
      (attribute, path) => {
        expect(handler.pathTo(attribute)).toEqual(path)
      }
    )
  })

  describe('#optionsFrom(element)', () => {
    let options

    beforeEach(() => {
      setup({
        prefix,
        aspectName,
        defaultOption,
        HTML: `
          <input
            id="element"
            ${prefix}:other-aspect="some value"
            ${prefix}:${aspectName}="1, 2, 3, 4, 5"
            ${prefix}:${aspectName}:number="-0.1e2"
            ${prefix}:${aspectName}:object="key1: 1, key2: { key1: 1, key2: 2, key3: [3] }"
            ${prefix}:${aspectName}:object:key-2="key2: 3, key3: [4, 5], key4: 6" >
        `
      })

      options = handler.optionsFrom(element)
    })

    test('should return an object with the options', () => {
      expect(options).toEqual({
        default: [1, 2, 3, 4, 5],
        number: -0.1e2,
        object: {
          key1: 1,
          key2: {
            key1: 1,
            key2: 3,
            key3: [4, 5],
            key4: 6
          }
        }
      })
    })

    test('should return recursively immutable object', () => {
      expect(Object.isFrozen(options)).toBeTruthy()
      expect(Object.isFrozen(options.object)).toBeTruthy()
      expect(Object.isFrozen(options.object.key2)).toBeTruthy()
      expect(Object.isFrozen(options.object.key2.key3)).toBeTruthy()
    })

    describe('when the aspect`s base attribute value is an object', () => {
      beforeEach(() => {
        setup({
          prefix,
          aspectName,
          defaultOption,
          HTML: `
            <input
              id="element"
              ${prefix}:${aspectName}="key: 'value'" >
          `
        })

        options = handler.optionsFrom(element)
      })

      test('should not add the default option to the return object', () => {
        expect(options).toEqual({ key: 'value' })
      })
    })
  })

  describe('.aspectsFrom(element, prefix, aspects)', () => {
    const aspects = [
      { config: { name: 'aspect-1' } },
      { config: { name: 'aspect-2' } },
      { config: { name: 'aspect-3' } },
      { config: { name: 'aspect-4' } },
      { config: { name: 'aspect-6' } }
    ]

    const prefix = 'mx'
    let element

    beforeEach(() => {
      document.body.innerHTML = `
        <input
          id="element"
          mx:aspect-1
          mx:aspect-1:option
          mx:aspect-3:option
          mx:aspect-2
          mx:aspect-4:option:option
          mx:aspect-5
          xm:aspect-6 >
      `

      element = document.querySelector('#element')
    })

    test('should filter the aspects present in the "element"', () => {
      expect(AttributeHandler.aspectsFrom(element, prefix, aspects)).toEqual([
        aspects[0], aspects[2], aspects[1], aspects[3]
      ])
    })
  })
})
