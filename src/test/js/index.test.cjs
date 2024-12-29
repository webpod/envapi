const assert = require('node:assert')
const { describe, it } = require('vitest')
const { parse } = require('envapi')

describe('cjs index', () => {
  it('exports', () => {
    assert.equal(typeof parse, 'function')
  })
})
