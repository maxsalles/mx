import isEmptyObject from './isEmptyObject'
import isPlainObject from './isPlainObject'
import deepFreeze from './deepFreeze'

function propertySetFrom (...objects) {
  return [...new Set(
    objects.filter(
      object => ['object', 'function'].includes(typeof object)
    ).map(Object.keys).flat())
  ]
}

export default function mergeAndFreeze (object, source) {
  if (source == null || isEmptyObject(source)) return deepFreeze(object)

  const properties = propertySetFrom(object, source)

  return properties.reduce((merged, property) => {
    const objectValue = object[property]
    const sourceValue = source[property]

    return Object.freeze({
      ...merged,
      [property]: [objectValue, sourceValue].every(isPlainObject)
        ? mergeAndFreeze(objectValue, sourceValue)
        : deepFreeze(sourceValue || objectValue)
    })
  }, Object.freeze({}))
}
