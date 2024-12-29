import * as assert from 'node:assert'
import { describe, it } from 'vitest'
import { parse, stringify } from '../../main/ts/index.js'

describe('parse/stringify', () => {
  it('works', () => {
    const str = `SIMPLE=xyz123
# comment ###
NON_INTERPOLATED='raw text without variable interpolation' 
MULTILINE = """
long text here, # not-comment
e.g. a private SSH key
"""
ENV=v1\nENV2=v2\n\n\n\t\t  ENV3  =    'v"3'   \n   export ENV4="v\`4"
ENV5="v'5" # comment
ENV6=\`v'"6\`
ENV7=
ENV8=''
JSON={"foo": "b a r"}
JSONSTR='{"foo": "b a r"}'
`
    const env = parse(str)
    assert.deepEqual(env, {
      SIMPLE: 'xyz123',
      NON_INTERPOLATED: 'raw text without variable interpolation',
      MULTILINE: 'long text here, # not-comment\ne.g. a private SSH key',
      ENV: 'v1',
      ENV2: 'v2',
      ENV3: 'v"3',
      ENV4: 'v`4',
      ENV5: "v'5",
      ENV6: `v'"6`,
      ENV7: '',
      ENV8: '',
      JSON: '{"foo": "b a r"}',
      JSONSTR: '{"foo": "b a r"}',
    })

    const nstr = stringify(env)
    assert.equal(nstr, `SIMPLE=xyz123
NON_INTERPOLATED="raw text without variable interpolation"
MULTILINE="long text here, # not-comment\ne.g. a private SSH key"
ENV=v1
ENV2=v2
ENV3='v"3'
ENV4="v\`4"
ENV5="v'5"
ENV6=\`v'"6\`
ENV7=
ENV8=
JSON='{"foo": "b a r"}'
JSONSTR='{"foo": "b a r"}'`
)
  })

  it('throws on invalid input', () => {
    assert.throws(() => parse('BRO-KEN=xyz123'))
    assert.throws(() => parse('BRO KEN=xyz123'))
    assert.throws(() => parse('1BROKEN=xyz123'))
  })
})
