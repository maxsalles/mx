import Aspect from '../../src/Aspect/Aspect'
import Storage from '../../src/Storage/Storage'
import NotImplementedError from '../../src/errors/NotImplementedError'
import AttributeHandler from '../../src/AttributeHandler/AttributeHandler'
import { DEFAULT_OPTION } from '../../src/Aspect/constants'

jest.mock('../../src/AttributeHandler/AttributeHandler', () => jest.fn())

const returnedOptions = {}
const optionsFrom = jest.fn().mockReturnValue(returnedOptions)

AttributeHandler.mockImplementation(() => ({ optionsFrom }))

describe('Aspect', () => {
  let aspect
  const storage = new Storage()
  const element = {}
  const aspectName = 'my-aspect'

  const host = {
    prefix: 'mx',
    resources: Object.freeze({
      key: 'value',
      otherKey: 'other value'
    })
  }

  afterEach(() => {
    storage.clear()
    AttributeHandler.mockClear()
    optionsFrom.mockClear()
  })

  describe('#effect', () => {
    aspect = new Aspect(host, storage, element)

    test('should throw "NotImplementedError" when called', () => {
      expect(() => aspect.effect()).toThrowError(NotImplementedError)
    })
  })

  describe('#apply(options)', () => {
    class MyAspect extends Aspect {
      static config = { name: aspectName }

      effect = jest.fn()
    }

    beforeEach(() => aspect = new MyAspect(host, storage, element))
    afterEach(() => aspect.effect.mockClear())

    describe('when it is first called', () => {
      describe('without "options"', () => {
        beforeEach(() => aspect.apply())

        test('should call the "effect" method', () => {
          expect(aspect.effect).toBeCalled()
        })

        test('should store the instance associating it to the element and its class', () => {
          expect(storage.from(element).get(MyAspect)).toBe(aspect)
        })
      })

      describe('with "options"', () => {
        const options = {}

        beforeEach(() => aspect.apply(options))

        test('should call the "effect" method with "options"', () => {
          expect(aspect.effect).toBeCalledWith(options)
        })

        test('should store the instance associating it to the element and its class', () => {
          expect(storage.from(element).get(MyAspect)).toBe(aspect)
        })
      })
    })

    describe('when called more than once', () => {
      beforeEach(() => {
        aspect.apply()
        aspect.apply()
      })

      test('should call the "effect" only once', () => {
        expect(aspect.effect).toBeCalledTimes(1)
      })
    })
  })

  describe('#undo()', () => {
    const undo = jest.fn()

    class MyAspect extends Aspect {
      static config = { name: aspectName }

      effect () {
        return undo
      }
    }

    beforeEach(() => aspect = new MyAspect(host, storage, element))
    afterEach(() => undo.mockClear())

    describe('when the "undo" is called without the "apply" ever having been called before', () => {
      beforeEach(() => aspect.undo())

      test('should not call the function returned by the "effect"', () => {
        expect(undo).not.toBeCalled()
      })
    })

    describe('when the "undo" is called after the "apply" has been called at some earlier time', () => {
      beforeEach(() => {
        aspect.apply()
        aspect.undo()
      })

      test('should call the function returned by the "effect"', () => {
        expect(undo).toBeCalled()
      })

      test('should remove the instance associating it to the element and its class', () => {
        expect(storage.from(element).get(MyAspect)).toBeUndefined()
      })
    })
  })

  describe('#reload(options)', () => {
    let undo, apply

    class MyAspect extends Aspect {
      static config = { name: aspectName }

      effect () {}
    }

    beforeEach(() => {
      aspect = new MyAspect(host, storage, element)
      undo = jest.spyOn(aspect, 'undo')
      apply = jest.spyOn(aspect, 'apply')
    })

    afterEach(() => {
      undo.mockClear()
      apply.mockClear()
    })

    afterAll(() => {
      undo.mockRestore()
      apply.mockRestore()
    })

    describe('without "options"', () => {
      beforeEach(() => aspect.reload())

      test('should call "undo"', () => {
        expect(undo).toBeCalledTimes(1)
      })

      test('should call "apply"', () => {
        expect(apply).toBeCalledTimes(1)
      })
    })

    describe('with "options"', () => {
      const options = {}

      beforeEach(() => aspect.reload())

      test('should call "undo"', () => {
        expect(undo).toBeCalledTimes(1)
      })

      test('should call "apply" with options', () => {
        expect(apply).toBeCalledWith(options)
      })
    })
  })

  describe('#element', () => {
    test('should return the "element"', () => {
      aspect = new Aspect(host, storage, element)

      expect(aspect.element).toBe(element)
    })
  })

  describe('#host', () => {
    test('should return the "element"', () => {
      aspect = new Aspect(host, storage, element)

      expect(aspect.host).toBe(host)
    })
  })

  describe('#resources', () => {
    describe('when the aspect instance have no "config.resources"', () => {
      class MyAspect extends Aspect {
        static config = { name: aspectName }

        effect () {}
      }

      test('should return "host.resources"', () => {
        aspect = new MyAspect(host, storage, element)

        expect(aspect.resources).toBe(host.resources)
      })
    })

    describe('when the aspect instance have "config.resources"', () => {
      class MyAspect extends Aspect {
        static config = {
          name: aspectName,
          resources: {
            otherKey: 'new value',
            newKey: {
              anotherKey: 'another value'
            }
          }
        }

        effect () {}
      }

      beforeEach(() => aspect = new MyAspect(host, storage, element))

      test('should return a recursive merge between "host.resources" and "config.resources"', () => {
        expect(aspect.resources).toEqual({
          key: 'value',
          otherKey: 'new value',
          newKey: {
            anotherKey: 'another value'
          }
        })
      })

      test('should return a recursively frozen object', () => {
        expect(Object.isFrozen(aspect.resources)).toBeTruthy()
        expect(Object.isFrozen(aspect.resources.newKey)).toBeTruthy()
      })

      test('should return the same object for different instances with the same "storage"', () => {
        const otherAspect = new MyAspect(host, storage, element)

        expect(aspect.resources).toBe(otherAspect.resources)
      })
    })
  })

  describe('#options', () => {
    let options

    class MyAspect extends Aspect {
      static config = {
        name: aspectName,
        defaultOption: 'main',
        basePath: 'some[0].path'
      }

      effect () {}
    }

    beforeEach(() => {
      aspect = new MyAspect(host, storage, element)
      options = aspect.options
    })

    test('should instantiate "AttributeHandler" with the proper arguments', () => {
      expect(AttributeHandler).toBeCalledWith(
        host.prefix,
        MyAspect.config.name,
        'main',
        aspect.resources,
        ['some', '0', 'path']
      )
    })

    test('should call "optionsFrom" method with the "element"', () => {
      expect(optionsFrom).toBeCalledWith(element)
    })

    test('should return the result of "optionsFrom" call', () => {
      expect(options).toBe(returnedOptions)
    })

    describe('without "config.defaultOption" or "basePath"', () => {
      class MyAspect extends Aspect {
        static config = { name: aspectName }

        effect () {}
      }

      beforeEach(() => {
        aspect = new MyAspect(host, storage, element)
        options = aspect.options
      })

      test('should instantiate "AttributeHandler" with the proper arguments', () => {
        expect(AttributeHandler).toBeCalledWith(
          host.prefix,
          MyAspect.config.name,
          DEFAULT_OPTION,
          aspect.resources,
          []
        )
      })
    })

    describe('when successive "options" calls occur', () => {
      let newCallOptions

      beforeEach(() => newCallOptions = aspect.options)

      test('should instantiate "AttributeHandler" only on the first call', () => {
        expect(AttributeHandler).toBeCalledTimes(1)
      })

      test('should return the same object for all calls', () => {
        expect(options).toBe(newCallOptions)
      })
    })
  })
})
