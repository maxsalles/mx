function reverseIterate ({ root, onEntering, onLeaving }) {
  onLeaving?.(root)

  const children = Array.from(root.children).reverse()

  for (let i = 0; i < children.length; i ++) {
    reverseIterate({ root: children[i], onEntering, onLeaving })
  }

  onEntering?.(root)
}

function iterate ({ root, onEntering, onLeaving }) {
  onEntering?.(root)

  const children = root.children

  for (let i = 0; i < children.length; i ++) {
    iterate({ root: children[i], onEntering, onLeaving })
  }

  onLeaving?.(root)
}

export default function iterateThroughDOM ({ root, reverse = false, onEntering, onLeaving }) {
  (reverse ? reverseIterate : iterate)({ root, onEntering, onLeaving })
}
