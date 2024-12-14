export default function objectFrom (path, value) {
  return path.reverse().reduce((object, attribute) => (
    { [attribute]: object }
  ), value)
}
