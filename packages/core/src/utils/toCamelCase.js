export default function toCamelCase (str) {
  return str.replace(/-([a-zA-Z0-9])/g, group => group[1].toUpperCase())
}
