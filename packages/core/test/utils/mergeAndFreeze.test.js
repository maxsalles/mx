import mergeAndFreeze from '../../src/utils/mergeAndFreeze'

describe('mergeAndFreeze', () => {
  const object = {
    key1: 'value',
    key2: {
      key21: {
        key211: 'value'
      }
    },
    key3: [1, 2, { key: 'value' }, [4]],
    key4: 'other value',
    key5: {
      key51: 'value',
      key52: [1, 2, 3],
      key53: {
        key531: 'other value'
      }
    }
  }

  const source = {
    key4: 'new value',
    key5: {
      key52: [4, 5, 6],
      key53: {
        key531: 'other value',
        key532: 'value'
      }
    },
    key6: {
      key61: 'value'
    }
  }

  let merged

  beforeEach(() => merged = mergeAndFreeze(object, source))

  test('should return a recursive merge of the "object" and the "source"', () => {
    expect(merged).toEqual({
      key1: 'value',
      key2: {
        key21: {
          key211: 'value'
        }
      },
      key3: [1, 2, { key: 'value' }, [4]],
      key4: 'new value',
      key5: {
        key51: 'value',
        key52: [4, 5, 6],
        key53: {
          key531: 'other value',
          key532: 'value'
        }
      },
      key6: {
        key61: 'value'
      }
    })
  })

  test('should return a recursively frozen object', () => {
    expect(Object.isFrozen(merged)).toBeTruthy()
    expect(Object.isFrozen(merged.key2)).toBeTruthy()
    expect(Object.isFrozen(merged.key21)).toBeTruthy()
    expect(Object.isFrozen(merged.key3)).toBeTruthy()
    expect(Object.isFrozen(merged.key3[2])).toBeTruthy()
    expect(Object.isFrozen(merged.key3[3])).toBeTruthy()
    expect(Object.isFrozen(merged.key5)).toBeTruthy()
    expect(Object.isFrozen(merged.key52)).toBeTruthy()
    expect(Object.isFrozen(merged.key53)).toBeTruthy()
    expect(Object.isFrozen(merged.key6)).toBeTruthy()
  })

  describe.each([undefined, null, {}, []])('when "source" is %s', source => {
    beforeEach(() => merged = mergeAndFreeze(object, source))

    test('should return a "object" copy', () => {
      expect(merged).not.toBe(object)
      expect(merged).toEqual(object)
    })

    test('should return a recursively frozen object', () => {
      expect(Object.isFrozen(merged)).toBeTruthy()
      expect(Object.isFrozen(merged.key2)).toBeTruthy()
      expect(Object.isFrozen(merged.key21)).toBeTruthy()
      expect(Object.isFrozen(merged.key3)).toBeTruthy()
      expect(Object.isFrozen(merged.key3[2])).toBeTruthy()
      expect(Object.isFrozen(merged.key3[3])).toBeTruthy()
      expect(Object.isFrozen(merged.key5)).toBeTruthy()
      expect(Object.isFrozen(merged.key52)).toBeTruthy()
      expect(Object.isFrozen(merged.key53)).toBeTruthy()
    })
  })
})
