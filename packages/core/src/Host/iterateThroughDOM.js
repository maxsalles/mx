function reverseIterate (root, onEntering, onLeaving) {
  onLeaving?.(root)

  const children = Array.from(root.children).reverse()

  for (let i = 0; i < children.length; i ++) {
    reverseIterate(children[i], onEntering, onLeaving)
  }

  onEntering?.(root)
}

function iterate (root, onEntering, onLeaving) {
  onEntering?.(root)

  const children = root.children

  for (let i = 0; i < children.length; i ++) {
    iterate(children[i], onEntering, onLeaving)
  }

  onLeaving?.(root)
}

export default function iterateThroughDOM (root, { onEntering, onLeaving, reverse = false } = {}) {
  (reverse ? reverseIterate : iterate)(root, onEntering, onLeaving)
}
