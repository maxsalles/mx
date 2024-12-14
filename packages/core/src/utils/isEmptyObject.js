export default function isEmptyObject (object) {
  if (!object) return true

  return Object.keys(object).length === 0
}
