# duplojs-what-was-sent
[![NPM version](https://img.shields.io/npm/v/@duplojs/what-was-sent)](https://www.npmjs.com/package/@duplojs/what-was-sent)

## Instalation
```
npm i @duplojs/what-was-sent
```

## Implémentation
```ts
import Duplo, {zod} from "@duplojs/duplojs";
import duploWhatWasSent, {IHaveSentThis} from "@duplojs/what-was-sent";

const duplo = Duplo({port: 1506, host: "localhost", environment: "DEV"});

duplo.use(duploWhatWasSent, {
    enabled: duplo.config.environment ===  "DEV"
});

duplo.declareRoute("GET", "/test/1")
.handler(
    ({}, res) => {
        res.code(200).send(100);
    },
    new IHaveSentThis(200, zod.string()) 
);

duplo.launch();
```

## Implémentation globales

```ts
duplo.use(duploWhatWasSent, {
    ...
    globals: true
});
```

tsconfig.json
```json
{
  "compilerOptions": {
    ...
    "types": [
        "@duplojs/what-was-sent/globals"
    ],
  }
}
```