import * as assert from 'assert'
import { replace } from '../src'

describe('replace', () => {
  it('should replace the imports', () => {
    assert.strictEqual(replace(`import * as A from 'fp-ts/lib/Array'`), `import * as A from 'fp-ts/es6/Array'`)
    assert.strictEqual(
      replace(`import * as A from 'fp-ts/lib/Array'\nimport { log } from 'fp-ts/lib/Console'`),
      `import * as A from 'fp-ts/es6/Array'\nimport { log } from 'fp-ts/es6/Console'`
    )
    assert.strictEqual(
      replace(`import * as A from 'fp-ts/lib/Array'

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    IO: IO<A>
  }
}`),
      `import * as A from 'fp-ts/es6/Array'

declare module 'fp-ts/es6/HKT' {
  interface URItoKind<A> {
    IO: IO<A>
  }
}`
    )
  })
})
