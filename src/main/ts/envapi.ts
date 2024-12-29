export const parse = (content: string): NodeJS.ProcessEnv => {
  const kr = /^[a-zA-Z_]+\w*$/
  const sr = /\s/
  const e: Record<string, string> = {}
  let k = ''
  let b = ''
  let q = ''
  let i = 0
  const cap = () => { if (k) {
      if (!kr.test(k)) throw new Error(`Invalid identifier: ${k}`)
      e[k] = b.trim(); b = k = ''
  }}

  for (const c of content.replace(/\r\n?/mg, '\n')) {
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
        if (!k || !b) continue
      }
      if (c === '=') {
        if (!k) { k = b; b = ''; continue }
      }
    }

    if (c === '"' || c === "'" || c === '`') {
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

const Q1 = '"' // double quote
const Q2 = "'" // single quote
const Q3 = '`' // backtick

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

export default { parse, stringify }
