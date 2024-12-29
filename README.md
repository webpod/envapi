# envapi
> An API to interact with environment files

## Install
```sh
yarn add envapi
``` 

## Usage
```ts
import { parse, stringify, config, load, loadSafe } from 'envapi'

const str = `
A=A
FOO = """bar
baz
"""
X:x #comment`

const env = parse(str)
{
  A: 'A',
  FOO: 'bar\nbaz',
  X: 'x'
}

const nstr = stringify(env)
`A=A
FOO="bar\nbaz"
X=x`

const raw = 'FOO=BAR\nBAZ=QUX'
await fs.writeFile('.env', raw)
const env1 = load('.env')

config('.env')
process.env.FOO // BAR
```

## License
[MIT](./LICENSE)
