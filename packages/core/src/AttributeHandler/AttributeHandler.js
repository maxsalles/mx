import { toCamelCase, objectFrom, isPlainObject, mergeAndFreeze } from '../utils'
import { SEPARATOR } from './constants'
import parseValue from './parseValue'

const PRIVATE = Symbol('private')

export default class AttributeHandler {
  constructor (prefix, aspectName, defaultOption, resources = {}, basePath = []) {
    Object.defineProperty(this, PRIVATE, {
      value: {
        prefix,
        aspectName,
        defaultOption,
        resources,
        basePath
      },
      writable: true
    })
  }

  get base () {
    const { prefix, aspectName } = this[PRIVATE]

    return `${prefix}${SEPARATOR}${aspectName}`
  }

  attributesFrom (element) {
    return Array.from(element.attributes).reduce(
      (attributes, { name, value }) => (
        name === this.base || name.startsWith(`${this.base}${SEPARATOR}`)
          ? { ...attributes, [name]: value }
          : attributes
      ),
      {}
    )
  }

  pathTo (attribute) {
    if (attribute === this.base) return []

    const radical = attribute.substring(this.base.length + 1)

    return radical.split(SEPARATOR).map(toCamelCase)
  }

  optionsFrom (element) {
    const { resources, basePath, defaultOption } = this[PRIVATE]
    const attributes = this.attributesFrom(element)

    return Object.entries(attributes).reduce((options, [attribute, value]) => {
      const path = this.pathTo(attribute)
      const parsedValue = parseValue(value, resources, basePath)

      const object = objectFrom(
        path.length || isPlainObject(parsedValue) ? path : [defaultOption],
        parsedValue
      )

      return mergeAndFreeze(options, object)
    }, {})
  }

  static aspectsFrom (element, prefix, aspects) {
    return Array.from(element.attributes).reduce((result, { name }) => {
      const Aspect = aspects.find(Aspect => {
        const { base } = (new AttributeHandler(prefix, Aspect.config.name))

        return base === name || name.startsWith(`${base}${SEPARATOR}`)
      })

      return !Aspect || result.includes(Aspect) ? result : [...result, Aspect]
    }, [])
  }
}
