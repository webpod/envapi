# envapi
> An API to interact with environment files

## Install
```sh
npm install envapi
``` 

## Usage
```ts
import { parse, stringify, config, load, loadSafe } from 'envapi'

const input = `A=A\nFOO=BAR`
const env = parse(input) // { A: 'A', FOO: 'BAR' }
const output = stringify(env) // A=A\nFOO=BAR
```

### parse()
Parse a dotenv string into an object.

```ts
const raw = `
A=A
FOO=BAR #comment`

const env = parse(raw) // { A: 'A', FOO: 'BAR' }
```

### stringify()
Stringify an object into a dotenv string.
    
```ts
const env = { A: 'A', FOO: 'BAR' }
const raw = stringify(env) // 'A=A\nFOO=BAR'
```

### load()
Read a dotenv file(s) and parse it into an object. `loadSafe()` suppresses ENOENT errors.
```ts
await fs.writeFile('.env1', 'FOO=BAR')
await fs.writeFile('.env2', 'BAZ=QUX')

const env = load('.env1', '.env2')      // { FOO: 'BAR', BAZ: 'QUX' }
const _env = loadSafe('.env.notexists') // {}
```


### config()
Load a dotenv file into `process.env`.

```ts
config('.env1')
process.env.FOO // BAR
```

## License
[MIT](./LICENSE)
