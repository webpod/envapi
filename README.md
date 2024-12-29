# envapi
> An API to interact with environment files

## Install
```sh
yarn add envapi
``` 

## Usage
```ts
import { parse, stringify } from 'envapi'

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
```

## License
[MIT](./LICENSE)
