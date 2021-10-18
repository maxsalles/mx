const PRIVATE = Symbol('private')

export default class Storage {
  constructor () {
    Object.defineProperty(this, PRIVATE, {
      value: {
        storage: new Map()
      },
      writable: true
    })
  }

  from (context) {
    const { storage } = this[PRIVATE]

    return {
      get: key => storage.get(context)?.get(key),
      remove: key => !!storage.get(context)?.delete(key),
      clear: () => storage.get(context)?.clear(),

      set (key, value) {
        let contextStorage = storage.get(context)

        if (!contextStorage) {
          contextStorage = new Map()

          storage.set(context, contextStorage)
        }

        contextStorage.set(key, value)
      },

      get values () {
        return [...storage.get(context)?.values() || []]
      }
    }
  }

  remove (context) {
    return this[PRIVATE].storage.delete(context)
  }

  clear () {
    this[PRIVATE].storage.clear()
  }
}
