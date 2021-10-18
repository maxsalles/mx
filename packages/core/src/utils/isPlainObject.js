export default function isPlainObject (value) {
  return value && !Array.isArray(value) && typeof value === 'object'
}
