# Functional Composition

> Babel plugin for functional code bases

## Get it

```sh
npm install --save-dev babel-plugin-functional-composition
```

## Use it

```js
// .babelrc
{
  "plugins": ["functional-composition", {
    "name": "pipe" // optional - defaults to `pipe`
    "as": "pipe" // optional - defaults to `pipe`
    "from": "ramda" // optional, but required for automatic imports
  }]
}
```

#### Left to right composition `>>`

```js
const add3 = x => x + 3
const add2 = x => x + 2

const y = add2 >> add3
// will become
const y = pipe(add2, add3)

```

#### Right to left composition `<<`
```js
const add3 = x => x + 3
const add2 = x => x + 2

const y = add2 << add3
// will become
const y = pipe(add3, add2)
```

#### Both directions of Composition

```js
const add3 = x => x + 3
const add2 = x => x + 2
const add1 = x => x + 1

const y = add2 >> add3 << add1
// will become
const y = pipe(add1, pipe(add2, add3))
```

#### `>>>` For non-curried functions

Suppose you have a functional API that is not curried you can now do this.
`>>>` will place the left expression as the last parameter to the right expression.

```js
import { map, from, scan } from 'most'

const add1 = x => x + 1

const x = from([1, 2, 3]) >>> map(add1) >>> scan(add1, 0)
// will become
const x = scan(add1, 0, map(add1, from([1, 2, 3])))

const y = 3 >>> add1
// will become
const y = add1(3)

```

#### This plugin is opt-in only - `use fc`

By default `>>`, `<<`, and `>>>` will do nothing for you that JS
does not already do, because in order to activate these features a directive must be applied.

```js
3 >>> 3 // still a bitwise operation

const add1 = x => x + 1

function add1To (x) {
  'use fc' // activates plugin in this scope

  return x >>> add1 // becomes add1(x)
}
```

### Notes about the options object

If the (optional) options object is provided, with at the minimum `from`, if the
import does not exist yet, the import will be added for you. This is useful for
things like eslint complaining about unused imports. `name` is the the part of the
object that you would normally import e.g. `pipe` in `import { pipe } from 'ramda'`.
If `name` is not the name you'd like to have imported as, perhaps it conflicts with
another import, you can specify `as` to import it as something else.
`import { pipe as sequence } from 'ramda'`, will be added to your files if the `as`
option is provided.

So for instance if your are using ramda all you will need is

```js
{
  "plugins": [
    ["functional-composition", { "from": "ramda" }]
  ]
}
```

and at the top of your file this plugin will add `import { pipe } from 'ramda'` for you.
