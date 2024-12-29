import * as assert from 'node:assert'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, test, afterAll } from 'vitest'
import { parse, stringify, load, loadSafe, config } from '../../main/ts/index.js'

const randomId= () => Math.random().toString(36).slice(2)
const tempdir = (prefix: string = `temp-${randomId()}`): string => {
  const dirpath = path.join(os.tmpdir(), prefix)
  fs.mkdirSync(dirpath, { recursive: true })
  return dirpath
}
const tempfile = (name?: string, data?: string | Buffer): string => {
  const filepath = name
    ? path.join(tempdir(), name)
    : path.join(os.tmpdir(), `temp-${randomId()}`)
  if (data === undefined) fs.closeSync(fs.openSync(filepath, 'w'))
  else fs.writeFileSync(filepath, data)
  return filepath
}

describe('parse/stringify', () => {
  test('works', () => {
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

  test('throws on invalid input', () => {
    assert.throws(() => parse('BRO-KEN=xyz123'))
    assert.throws(() => parse('BRO KEN=xyz123'))
    assert.throws(() => parse('1BROKEN=xyz123'))
  })

  describe('load()', () => {
    const file1 = tempfile('.env.1', 'ENV1=value1\nENV2=value2')
    const file2 = tempfile('.env.2', 'ENV2=value222\nENV3=value3')
    afterAll(() => {
      fs.unlinkSync(file1)
      fs.unlinkSync(file2)
    })

    test('loads env from files', () => {
      const env = load(file1, file2)
      assert.equal(env.ENV1, 'value1')
      assert.equal(env.ENV2, 'value2')
      assert.equal(env.ENV3, 'value3')
    })

    test('throws error on ENOENT', () => {
      try {
        load('./.env')
        throw new Error('shouldnt have thrown')
      } catch (e: any) {
        assert.equal(e.code, 'ENOENT')
        assert.equal(e.errno, -2)
      }
    })
  })

  describe('loadSafe()', () => {
    const file1 = tempfile('.env.1', 'ENV1=value1\nENV2=value2')
    const file2 = '.env.notexists'

    afterAll(() => fs.unlinkSync(file1))

    test('loads env from files', () => {
      const env = loadSafe(file1, file2)
      assert.equal(env.ENV1, 'value1')
      assert.equal(env.ENV2, 'value2')
    })
  })

  describe('config()', () => {
    test('updates process.env', () => {
      const file1 = tempfile('.env.1', 'ENV1=value1')

      assert.equal(process.env.ENV1, undefined)
      config(file1)
      assert.equal(process.env.ENV1, 'value1')
      delete process.env.ENV1
    })
  })
})
