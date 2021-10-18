import { deepFreeze } from '../utils'
import Storage from '../Storage'
import AttributeHandler from '../AttributeHandler'
import { DEFAULT_PREFIX } from './constants'
import iterateThroughDOM from './iterateThroughDOM'

const PRIVATE = Symbol('private')

export default class Host {
  constructor ({
    root = document.body,
    aspects = [],
    prefix = DEFAULT_PREFIX,
    resources = {}
  } = {}) {
    Object.defineProperty(this, PRIVATE, {
      value: {
        root,
        prefix: prefix,
        aspects: [...new Set(aspects.flat(Infinity).filter(Boolean))],
        resources: deepFreeze(resources),
        storage: new Storage()
      },
      writable: true
    })
  }

  get prefix () {
    return this[PRIVATE].prefix
  }

  get root () {
    return this[PRIVATE].root
  }

  get aspects () {
    return [...this[PRIVATE].aspects]
  }

  get resources () {
    return this[PRIVATE].resources
  }

  apply (element, Aspect, options) {
    const aspect = new Aspect(this, this[PRIVATE].storage, element)

    aspect.apply(options)

    return this
  }

  undo (element, Aspect) {
    this[PRIVATE].storage.from(element).get(Aspect)?.undo()

    return this
  }

  reload (element, Aspect, options) {
    this[PRIVATE].storage.from(element).get(Aspect)?.reload(options)

    return this
  }

  aspectsFrom (element) {
    const { prefix, aspects } = this[PRIVATE]

    return AttributeHandler.aspectsFrom(element, prefix, aspects)
  }

  async mount (element) {
    const root = element || this[PRIVATE].root

    for (const Aspect of this[PRIVATE].aspects) Aspect.setup?.(this, root)

    iterateThroughDOM({
      root,
      onEntering: currentElement => {
        for (const Aspect of this.aspectsFrom(currentElement)) {
          this.apply(currentElement, Aspect)
        }
      }
    })

    return true
  }

  async unmount (element) {
    const { aspects, storage } = this[PRIVATE]
    const root = element || this[PRIVATE].root

    iterateThroughDOM({
      root: root,
      reverse: true,
      onEntering: currentElement => {
        const aspectInstances = storage.from(currentElement).values

        for (const aspectInstance of aspectInstances.reverse()) {
          this.undo(currentElement, aspectInstance.constructor)
        }
      }
    })

    for (const Aspect of aspects.reverse()) {
      Aspect.terminate?.(this, root)
    }

    return true
  }
}
