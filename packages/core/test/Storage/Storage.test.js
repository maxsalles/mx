import Storage from '../../src/Storage/Storage'

describe('Storage', () => {
  const storage = new Storage()
  const context = {}
  const otherContext = {}

  afterEach(() => storage.clear())

  describe('#from(context)', () => {
    test('should return an object with "get", "values", "set", "remove" and "clear" properties', () => {
      expect(storage.from(context)).toEqual({
        get: expect.any(Function),
        values: expect.any(Array),
        set: expect.any(Function),
        remove: expect.any(Function),
        clear: expect.any(Function)
      })
    })

    describe('#set(key, value) and #get(key)', () => {
      const { set, get } = storage.from(context)

      test('should add and retrieve a value for a "key", respectively', () => {
        set('key', 'value')

        expect(get('key')).toBe('value')
      })
    })

    describe('#remove(key)', () => {
      const { set, get, remove } = storage.from(context)

      beforeEach(() => {
        set('key', 'value')
        set('keyToBeRemoved', 'other value')
      })

      test('should return true when "key" removal was successful', () => {
        expect(remove('keyToBeRemoved')).toBeTruthy()
      })

      test('should return false when the "key" was not previously added', () => {
        expect(remove('nonExistentKey')).toBeFalsy()
      })

      test('should remove a "key" if it was previously added', () => {
        remove('keyToBeRemoved')

        expect(get('keyToBeRemoved')).toBeUndefined()
      })

      test('removing one "key" should not interfere with the others.', () => {
        remove('keyToBeRemoved')

        expect(get('key')).toBe('value')
      })
    })

    describe('#clear()', () => {
      const { set, get, clear } = storage.from(context)

      beforeEach(() => {
        set('key', 'value')
        set('anotherKey', 'other value')
      })

      test('should remove all "key" entries', () => {
        clear()

        expect(get('key')).toBeUndefined()
        expect(get('anotherKey')).toBeUndefined()
      })
    })

    describe('#values', () => {
      const { set } = storage.from(context)

      test('should return a list of values from a context in the order they were inserted', () => {
        set('key', 'value')
        set('other-key', 'other value')
        set('another-key', 'another value')

        expect(storage.from(context).values).toEqual(
          ['value', 'other value', 'another value']
        )
      })
    })
  })

  describe('#remove(context)', () => {
    const nonExistentElement = {}

    beforeEach(() => {
      storage.from(context).set('key', 'value')
      storage.from(context).set('anotherKey', 'other value')
      storage.from(otherContext).set('key', 'value')
      storage.from(otherContext).set('anotherKey', 'other value')
    })

    test('should return true when "context" removal was successful', () => {
      expect(storage.remove(context)).toBeTruthy()
    })

    test('should return false when the "context" was not previously added', () => {
      expect(storage.remove(nonExistentElement)).toBeFalsy()
    })

    test('should remove a "context" if it was previously added', () => {
      storage.remove(context)

      expect(storage.from(context).get('key')).toBeUndefined()
      expect(storage.from(context).get('anotherKey')).toBeUndefined()
    })

    test('removing one "key" should not interfere with the others.', () => {
      storage.remove(context)

      expect(storage.from(otherContext).get('key')).toBe('value')
      expect(storage.from(otherContext).get('anotherKey')).toBe('other value')
    })
  })

  describe('#clear()', () => {
    beforeEach(() => {
      storage.from(context).set('key', 'value')
      storage.from(otherContext).set('key', 'value')
    })

    test('should remove all "context" entries', () => {
      storage.clear()

      expect(storage.from(context).get('key')).toBeUndefined()
      expect(storage.from(otherContext).get('key')).toBeUndefined()
    })
  })
});
