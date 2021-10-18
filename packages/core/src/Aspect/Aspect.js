import AttributeHandler from '../AttributeHandler'
import { NotImplementedError } from '../errors'
import { mergeAndFreeze, isEmptyObject, parsePath } from '../utils'
import { DEFAULT_OPTION, RESOURCES_KEY } from './constants'

const PRIVATE = Symbol('private')

export default class Aspect {
  constructor (host, storage, element) {
    Object.defineProperty(this, PRIVATE, {
      value: {
        host,
        storage,
        element,
        resources: null,
        options: null,
        undo: null
      },
      writable: true
    })
  }

  get element () {
    return this[PRIVATE].element
  }

  get host () {
    return this[PRIVATE].host
  }

  get resources () {
    const { get, set } = this[PRIVATE].storage.from(this.constructor)
    const { host } = this[PRIVATE]
    const { config } = this.constructor

    if (!get(RESOURCES_KEY)) {
      set(
        RESOURCES_KEY,
        isEmptyObject(config.resources)
          ? host.resources
          : mergeAndFreeze(host.resources, config.resources)
      )
    }

    return get(RESOURCES_KEY)
  }

  get options () {
    const { options, host, element } = this[PRIVATE]

    if (options) return options

    const {
      name: aspectName,
      defaultOption = DEFAULT_OPTION,
      basePath = []
    } = this.constructor.config

    this[PRIVATE].options = (new AttributeHandler(
      host.prefix,
      aspectName,
      defaultOption,
      this.resources,
      parsePath(basePath)
    )).optionsFrom(element)

    return this[PRIVATE].options
  }

  effect () {
    throw new NotImplementedError('effect')
  }

  apply (options = {}) {
    const { storage, element } = this[PRIVATE]

    if (storage.from(element).get(this.constructor)) return

    const undo = this.effect(options ? options : this.options)

    if (typeof undo === 'function') this[PRIVATE].undo = undo

    storage.from(element).set(this.constructor, this)
  }

  undo () {
    const { storage, element, undo: performUndo } = this[PRIVATE]

    if (!storage.from(element).get(this.constructor)) return

    performUndo?.()
    storage.from(element).remove(this.constructor)
  }

  reload (options = {}) {
    this.undo()
    this.apply(options)
  }
}
