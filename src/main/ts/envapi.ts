import fs from 'node:fs'
import path from 'node:path'

const Q1 = '"' // double quote
const Q2 = "'" // single quote
const Q3 = '`' // backtick

export const parse = (content: string | Buffer): NodeJS.ProcessEnv => {
  const kr = /^[a-zA-Z_]+\w*$/
  const sr = /\s/
  const e: Record<string, string> = {}
  let k = ''
  let b = ''
  let q = ''
  let i = 0
  const cap = () => {
    k = k.trim()
    if (k) {
      if (!kr.test(k)) throw new Error(`Invalid identifier: ${k}`)
      e[k] = b.trim(); b = k = ''
    }
  }

  for (const c of content.toString().replace(/\r\n?/mg, '\n')) {
    if (i) {
      if (c === '\n') i = 0
      continue
    }
    if (!q) {
      if (c === '#') {
        i = 1
        continue
      }
      if (c === '\n') {
        cap()
        continue
      }
      if (sr.test(c)) {
        if (!k && b === 'export') b = ''
        if (!b) continue
      }
      if (c === '=') {
        if (!k) { k = b; b = ''; continue }
      }
    }

    if (c === Q1 || c === Q2 || c === Q3) {
      if (!q && !b) {
        q = c
        continue
      }
      if (q === c) {
        q = ''
        b && cap()
        continue
      }
    }
    b += c
  }
  cap()

  return e
}

const formatValue = (v: string): string => {
  const q1 = v.includes(Q1)
  const q2 = v.includes(Q2)
  const q3 = v.includes(Q3)
  const s = /\s/.test(v)

  if (!q1 && !q2 && !q3 && !s) return v
  if (!q1) return `${Q1}${v}${Q1}`
  if (!q2) return `${Q2}${v}${Q2}`
  return `${Q3}${v}${Q3}`
}

export const stringify = (env: NodeJS.ProcessEnv): string =>
  Object.entries(env).map(([k, v]) => `${k}=${formatValue(v || '')}`).join('\n')

const _load = (
  read: (file: string) => string,
  ...files: string[]
): NodeJS.ProcessEnv =>
  files
    .reverse()
    .reduce((m, f) => Object.assign(m, parse(read(path.resolve(f)))), {})
export const load = (...files: string[]): NodeJS.ProcessEnv =>
  _load((file) => fs.readFileSync(file, 'utf8'), ...files)
export const loadSafe = (...files: string[]): NodeJS.ProcessEnv =>
  _load(
    (file: string): string =>
      fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '',
    ...files
  )

export const config = (def = '.env', ...files: string[]): NodeJS.ProcessEnv =>
  Object.assign(process.env, loadSafe(def, ...files))

export default { parse, stringify, load, loadSafe, config }
