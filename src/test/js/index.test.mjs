import assert from 'node:assert'
import { describe, it } from 'vitest'
import { parse } from 'envapi'

describe('esm index', () => {
  it('exports', () => {
    assert.equal(typeof parse, 'function')
  })
})
