import fs from 'node:fs'
import path from 'node:path'
import { TextDecoder } from 'node:util'

const DOTENV = '.env'
const Q1 = '"' // double quote
const Q2 = "'" // single quote
const Q3 = '`' // backtick
const KR = /^[a-zA-Z_]\w*$/
const SR = /\s/
const decoder = new TextDecoder()

export const parse = (content: string | Buffer): NodeJS.ProcessEnv => {
  const e: Record<string, string> = {}
  let k = ''  // key
  let b = ''  // buffer
  let q = ''  // quote
  let i = 0   // ignore
  const cap = () => {
    k = k.trim()
    if (k) {
      if (!KR.test(k)) throw new Error(`Invalid identifier: ${k}`)
      e[k] = b.trim(); b = k = ''
    }
  }

  for (const c of (typeof content === 'string' ? content : decoder.decode(content))) {
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
      if (SR.test(c)) {
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
  const s = SR.test(v)

  if (!q1 && !q2 && !q3 && !s) return v
  if (!q1) return `${Q1}${v}${Q1}`
  if (!q2) return `${Q2}${v}${Q2}`
  if (parse(`V=${Q3}${v}${Q3}`).V !== v) throw new Error(`Invalid value: ${v}`)
  return `${Q3}${v}${Q3}`
}

export const stringify = (env: NodeJS.ProcessEnv): string =>
  Object.entries(env).map(([k, v]) => `${k}=${formatValue(v || '')}`).join('\n')

const _load = (read: (file: string) => string, ...files: string[]): NodeJS.ProcessEnv =>
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

export const populate = (env: NodeJS.ProcessEnv, extra?: NodeJS.ProcessEnv): NodeJS.ProcessEnv =>
  Object.assign(env, extra)

export const config = (def = DOTENV, ...files: string[]): NodeJS.ProcessEnv =>
  populate(process.env, loadSafe(def, ...files))
