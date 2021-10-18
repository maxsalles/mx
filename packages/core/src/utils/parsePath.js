export default function parsePath (value = []) {
  return Array.isArray(value)
    ? value
    : value.split(/\.|\[|\]\[|\]\.|\]/g).filter(v => v)
}
