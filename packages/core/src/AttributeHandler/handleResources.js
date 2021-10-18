export default function handleResources (pathString, { resources, basePath }) {
  const path = pathString.startsWith('~')
    ? [...basePath, ...pathString.substring(1).split('/')]
    : pathString.substring(1).split('/')

  return path.reduce((context, current) => context?.[current], resources)
}
