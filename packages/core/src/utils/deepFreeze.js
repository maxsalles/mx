export default function deepFreeze (object) {
  if (typeof object !== 'object') return object

  const initialValue = Object.freeze(Array.isArray(object) ? [] : {})

  return Object.entries(object).reduce((freezed, [key, value]) => {
    const freezedValue = deepFreeze(value)

    return Object.freeze(
      Array.isArray(freezed)
        ? [...freezed, freezedValue]
        : { ...freezed, [key]: freezedValue }
    )
  }, initialValue)
}
