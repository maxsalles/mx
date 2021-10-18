/**
 * @jest-environment jsdom
 */

import Host from '../../src/Host/Host'
import { DEFAULT_PREFIX } from '../../src/Host/constants'
import Storage from '../../src/Storage/Storage'
import Aspect from '../../src/Aspect/Aspect'
import AttributeHandler from '../../src/AttributeHandler/AttributeHandler'

describe('Host', () => {
  describe('#prefix', () => {
    const host = new Host()

    test(`should return "${DEFAULT_PREFIX}" by default`, () => {
      expect(host.prefix).toBe(DEFAULT_PREFIX)
    })

    describe('when the "prefix" is passed to the constructor', () => {
      const prefix = 'app'
      const host = new Host({ prefix })

      test('shoult return the "prefix"', () => {
        expect(host.prefix).toBe(prefix)
      })
    })
  })

  describe('#root', () => {
    const host = new Host()

    test('should return "document.body" by default', () => {
      expect(host.root).toBe(document.body)
    })

    describe('when the "root" is passed to the constructor', () => {
      const root = document
      const host = new Host({ root })

      test('shoult return the "root"', () => {
        expect(host.root).toBe(root)
      })
    })
  })

  describe('#aspects', () => {
    const host = new Host()

    test('should return an empty array by default', () => {
      expect(host.aspects).toEqual([])
    })

    describe('when the "aspects" are passed to the constructor', () => {
      const Aspect = class {}
      const OtherAspect = class {}
      const AnotherAspect = class {}
      const aspects = [Aspect, OtherAspect, , [AnotherAspect, [null, [Aspect]]]]
      const host = new Host({ aspects })

      test('should return an array with aspects, without repetition or null values', () => {
        expect(host.aspects).toEqual([Aspect, OtherAspect, AnotherAspect])
      })
    })
  })

  describe('#resources', () => {
    const host = new Host()

    test('should return an empty object by default', () => {
      expect(host.resources).toEqual({})
    })

    test('should return a frozen object', () => {
      expect(Object.isFrozen(host.resources)).toBeTruthy()
    })

    describe('when the "resources" is passed to the constructor', () => {
      const resources = {
        key1: 'value',
        key2: {
          key21: 'value',
          key22: {
            key221: [1, 2, 3]
          }
        },
        key3: [1, { key: 'value' }, 3]
      }

      const host = new Host({ resources })

      test('shoult return the "resources" copy', () => {
        expect(host.resources).toEqual(resources)
      })

      test('should return a recursively frozen object', () => {
        expect(Object.isFrozen(host.resources)).toBeTruthy()
        expect(Object.isFrozen(host.resources.key2)).toBeTruthy()
        expect(Object.isFrozen(host.resources.key2.key22)).toBeTruthy()
        expect(Object.isFrozen(host.resources.key2.key22.key221)).toBeTruthy()
        expect(Object.isFrozen(host.resources.key3)).toBeTruthy()
        expect(Object.isFrozen(host.resources.key3[1])).toBeTruthy()
      })
    })
  })

  describe('#apply(element, Aspect, options)', () => {
    const element = document.body
    const apply = jest.fn()
    const Aspect = jest.fn().mockImplementation(() => ({ apply }))
    const host = new Host()

    afterEach(() => {
      apply.mockClear()
      Aspect.mockClear()
    })

    test('should instantiate the "Aspect" with the proper arguments.', () => {
      host.apply(element, Aspect)

      expect(Aspect).toBeCalledWith(host, expect.any(Storage), element)
    })

    test('should call the "apply" method of the "Aspect" instance', () => {
      host.apply(element, Aspect)

      expect(apply).toBeCalled()
    })

    test('should return "this"', () => {
      expect(host.apply(element, Aspect)).toBe(host)
    })

    describe('when the "options" are present', () => {
      const options = {}

      test('should call the "apply" method of the "Aspect" instance with the "Options"', () => {
        host.apply(element, Aspect, options)

        expect(apply).toBeCalledWith(options)
      })
    })
  })

  describe('#undo(element, Aspect)', () => {
    const undo = jest.fn()
    const element = document.body

    class MyAspect extends Aspect {
      effect () {
        return undo
      }
    }

    afterEach(() => undo.mockClear())

    describe('when the "Aspect" has not yet been applied to the "element"', () => {
      const host = new Host()

      beforeEach(() => host.apply(element, MyAspect))

      test('should call the "Aspect" instance "undo" method', () => {
        host.undo(element, MyAspect)

        expect(undo).toBeCalled()
      })

      test('should return "this"', () => {
        expect(host.undo(element, MyAspect)).toBe(host)
      })
    })

    describe('when the" Aspect" has already been applied to the "element"', () => {
      const host = new Host()

      test('should not call "Aspect" instance "undo" method', () => {
        host.undo(element, MyAspect)

        expect(undo).not.toBeCalled()
      })

      test('should return "this"', () => {
        expect(host.undo(element, MyAspect)).toBe(host)
      })
    })
  })

  describe('#reload(element, Aspect, options)', () => {
    const reload = jest.fn()
    const element = document.body

    class MyAspect extends Aspect {
      effect () {}

      reload = reload
    }

    afterEach(() => reload.mockClear())

    describe('when the" Aspect" has already been applied to the "element', () => {
      const host = new Host()

      beforeEach(() => host.apply(element, MyAspect))

      test('should call "Aspect" instance "reload" method', () => {
        host.reload(element, MyAspect)

        expect(reload).toBeCalled()
      })

      test('should return "this"', () => {
        expect(host.reload(element, MyAspect)).toBe(host)
      })

      describe('and the options are present', () => {
        const options = {}

        test('should call "Aspect" instance "reload" method with the "options"', () => {
          host.reload(element, MyAspect, options)

          expect(reload).toBeCalledWith(options)
        })
      })
    })

    describe('when the "Aspect" has not yet been applied to the "element"', () => {
      const host = new Host()

      test('should not call "Aspect" instance "reload" method', () => {
        host.reload(element, MyAspect)

        expect(reload).not.toBeCalled()
      })

      test('should return "this"', () => {
        expect(host.reload(element, MyAspect)).toBe(host)
      })
    })
  })

  describe('#aspectsFrom(element)', () => {
    const host = new Host({ prefix: 'app', aspects: [class {}, class {}] })
    const element = document.body
    const returnedAspects = []

    let aspectsFrom

    beforeAll(() => {
      aspectsFrom = jest
      .spyOn(AttributeHandler, 'aspectsFrom')
      .mockReturnValue(returnedAspects)
    })

    afterEach(() => aspectsFrom.mockClear())
    afterAll(() => aspectsFrom.mockRestore())

    test('should call "AttributeHandler.aspectsFrom" with the proper arguments', () => {
      host.aspectsFrom(element)

      expect(aspectsFrom).toBeCalledWith(element, host.prefix, host.aspects)
    })

    test('should return the result of the "AttributeHandler.aspectsFrom" call', () => {
      expect(host.aspectsFrom(element)).toBe(returnedAspects)
    })
  })

  describe('#mount(element)', () => {
    class MyAspect extends Aspect {
      static config = {
        name: 'my-aspect'
      }

      static setup = jest.fn()

      effect () {}
    }

    class MyOtherAspect extends Aspect {
      static config = {
        name: 'my-other-aspect'
      }

      static setup = jest.fn()

      effect () {}
    }

    class MyAnotherAspect extends Aspect {
      static config = {
        name: 'my-another-aspect'
      }

      effect () {}
    }

    let host, apply

    beforeEach(() => {
      document.body.innerHTML = `
        <div mx:my-aspect id="el-1">
          <div mx:my-other-aspect id="el-1-1"></div>
          <div mx:my-other-aspect mx:my-another-aspect id="el-1-3"></div>
        </div>
        <div mx:my-another-aspect id="el-2"></div>
        <div></div>
        <div mx:nonexistent-aspect></div>
      `

      host = new Host({ aspects: [MyAspect, MyOtherAspect, MyAnotherAspect] })
      apply = jest.spyOn(host, 'apply')
    })

    afterEach(() => {
      MyAspect.setup.mockClear()
      MyOtherAspect.setup.mockClear()
      apply.mockClear()
      document.body.innerHTML = ''
    })

    test('should call "setup" for all aspect classes', async () => {
      await host.mount()

      expect(MyAspect.setup).toBeCalledWith(host, host.root)
      expect(MyOtherAspect.setup).toBeCalledWith(host, host.root)
    })

    test('should call the "apply" method for each aspect instance in the proper order', async () => {
      await host.mount()

      expect(apply).toBeCalledTimes(5)
      expect(apply).nthCalledWith(1, document.querySelector('#el-1'), MyAspect)
      expect(apply).nthCalledWith(2, document.querySelector('#el-1-1'), MyOtherAspect)
      expect(apply).nthCalledWith(3, document.querySelector('#el-1-3'), MyOtherAspect)
      expect(apply).nthCalledWith(4, document.querySelector('#el-1-3'), MyAnotherAspect)
      expect(apply).nthCalledWith(5, document.querySelector('#el-2'), MyAnotherAspect)
    })

    test('should resolve "true"', async () => {
      expect(await host.mount()).toBeTruthy()
    })

    describe('with "element"', () => {
      test('should call the "apply" only for the internal or contained aspects of the "element"', async () => {
        const element = document.querySelector('#el-1')

        await host.mount(element)

        expect(apply).toBeCalledTimes(4)
        expect(apply).nthCalledWith(1, document.querySelector('#el-1'), MyAspect)
        expect(apply).nthCalledWith(2, document.querySelector('#el-1-1'), MyOtherAspect)
        expect(apply).nthCalledWith(3, document.querySelector('#el-1-3'), MyOtherAspect)
        expect(apply).nthCalledWith(4, document.querySelector('#el-1-3'), MyAnotherAspect)
      })
    })
  })

  describe('#unmount(element)', () => {
    class MyAspect extends Aspect {
      static config = {
        name: 'my-aspect'
      }

      static terminate = jest.fn()

      effect () {}
    }

    class MyOtherAspect extends Aspect {
      static config = {
        name: 'my-other-aspect'
      }

      static terminate = jest.fn()

      effect () {}
    }

    class MyAnotherAspect extends Aspect {
      static config = {
        name: 'my-another-aspect'
      }

      effect () {}
    }

    let host, undo

    beforeEach(() => {
      document.body.innerHTML = `
        <div mx:my-aspect id="el-1">
          <div mx:my-other-aspect id="el-1-1"></div>
          <div mx:my-other-aspect mx:my-another-aspect id="el-1-3"></div>
        </div>
        <div mx:my-another-aspect id="el-2"></div>
        <div></div>
        <div mx:nonexistent-aspect></div>
      `

      host = new Host({ aspects: [MyAspect, MyOtherAspect, MyAnotherAspect] })
      undo = jest.spyOn(host, 'undo')
    })

    afterEach(() => {
      MyAspect.terminate.mockClear()
      MyOtherAspect.terminate.mockClear()
      undo.mockClear()
      document.body.innerHTML = ''
    })

    describe('when called for an element that has already received the "mount" call', () => {
      test('should call "terminate" for all aspect classes', async () => {
        await host.mount()
        await host.unmount()

        expect(MyAspect.terminate).toBeCalledWith(host, host.root)
        expect(MyOtherAspect.terminate).toBeCalledWith(host, host.root)
      })

      test('should call the "undo" method for each aspect instance in the proper order', async () => {
        await host.mount()
        await host.unmount()

        expect(undo).toBeCalledTimes(5)
        expect(undo).nthCalledWith(1, document.querySelector('#el-2'), MyAnotherAspect)
        expect(undo).nthCalledWith(2, document.querySelector('#el-1-3'), MyAnotherAspect)
        expect(undo).nthCalledWith(3, document.querySelector('#el-1-3'), MyOtherAspect)
        expect(undo).nthCalledWith(4, document.querySelector('#el-1-1'), MyOtherAspect)
        expect(undo).nthCalledWith(5, document.querySelector('#el-1'), MyAspect)
      })

      test('should resolve "true"', async () => {
        expect(await host.unmount()).toBeTruthy()
      })

      describe('with "element"', () => {
        test('should call the "undo" only for the internal or contained aspects of the "element"', async () => {
          const element = document.querySelector('#el-1')

          await host.mount()
          await host.unmount(element)

          expect(undo).toBeCalledTimes(4)
          expect(undo).nthCalledWith(1, document.querySelector('#el-1-3'), MyAnotherAspect)
          expect(undo).nthCalledWith(2, document.querySelector('#el-1-3'), MyOtherAspect)
          expect(undo).nthCalledWith(3, document.querySelector('#el-1-1'), MyOtherAspect)
          expect(undo).nthCalledWith(4, document.querySelector('#el-1'), MyAspect)
        })
      })
    })

    describe('when called for an element did not receive the "mount" call', () => {
      test('should call "terminate" for all aspect classes', async () => {
        await host.unmount()

        expect(MyAspect.terminate).toBeCalledWith(host, host.root)
        expect(MyOtherAspect.terminate).toBeCalledWith(host, host.root)
      })

      test('should not call the "undo" method', async () => {
        await host.unmount()

        expect(undo).not.toBeCalled()
      })
    })
  })
})
