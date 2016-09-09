const DIRECTIVE = 'use fc'
const LEFTPIPE = '>>'
const RIGHTPIPE = '<<'
const TRIPLEPIPE = '>>>'

export default function ({ types: t }) {
  const id = name => t.identifier(name)

  function pipe (fnName, ...args) {
    return t.callExpression(id(fnName), args)
  }

  function importAs (name, as, from) {
    return t.importDeclaration([
      t.importSpecifier(t.identifier(name), t.identifier(as))
    ], t.stringLiteral(from))
  }

  let fileHasDirective = false

  const visitor = {
    Program: {
      enter (path, { opts }) {
        fileHasDirective = false
      },

      exit (path, opts) {
        const { name = 'pipe', as = 'pipe', from } = opts || {}

        if (fileHasDirective && from && !path.scope.hasBinding(as)) {
          path.unshiftContainer('body', importAs(name, as, from))
        }
      }
    },

    CallExpression: {
      /* transform multiple pipe calls into as few pipe calls as possible */
      exit (path, { opts }) {
        if (!hasDirective(path)) return

        fileHasDirective = true

        const { as = 'pipe' } = opts || {}

        if (isPipeCall(as, path.node)) {
          const [left, right] = path.node.arguments
          if (!left || !right) return

          if (isPipeCall(as, left)) {
            path.replaceWith(pipe(as, ...left.arguments, right))
          }
        }
      }
    },

    BinaryExpression: {
      /* transform >> and << into calls to pipe() */
      enter (path, { opts }) {
        if (!hasDirective(path)) return

        fileHasDirective = true

        const { as = 'pipe' } = opts || {}

        if (isPipe(path)) {
          const [left, right] = side(path)
          if (!left.node || !right.node) return

          path.replaceWith(pipe(as, left.node, right.node))
        }

        if (isAntiPipe(path)) {
          const [left, right] = side(path)
          if (!left.node || !right.node) return

          path.replaceWith(pipe(as, right.node, left.node))
        }

        if (isTriplePipe(path)) {
          const [ left, right ] = side(path)
          if (!left.node || !right.node) return

          if (t.isIdentifier(right)) {
            path.replaceWith(pipe(right.node.name, left.node))
          }

          if (t.isCallExpression(right)) {
            path.replaceWith(pipe(right.node.callee.name,
              ...right.node.arguments, left.node))
          }
        }
      }
    }
  }

  return { visitor }
}

/* check to see if scope has directive "use pipe" */
function hasDirective (path) {
  let matched = false

  path.findParent(({ node }) => {
    node.directives && node.directives.some(({ value }) => {
      matched = value.value === DIRECTIVE
    })
  })

  return matched
}

/* check if an ast node is a function call pipe */
function isPipeCall (as, node) {
  return node.callee && node.callee.name === as
}

/* checks if an BinaryExpression is an pipe call */
function isPipe (path) {
  return path.node.operator === LEFTPIPE
}

/* checks if an BinaryExpression is a right pipe call */
function isAntiPipe (path) {
  return path.node.operator === RIGHTPIPE
}

function isTriplePipe (path) {
  return path.node.operator === TRIPLEPIPE
}

/* gets the nodes to the left and right of a path */
function side (path) {
  return [ leftOf(path), rightOf(path) ]
}

/* gets the path left of a given path */
function leftOf (path) {
  return path.get('left')
}

/* get the path right of a given path */
function rightOf (path) {
  return path.get('right')
}
