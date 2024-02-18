# duplojs-what-was-sent
[![NPM version](https://img.shields.io/npm/v/@duplojs/what-was-sent)](https://www.npmjs.com/package/@duplojs/what-was-sent)

## Instalation
```
npm i @duplojs/what-was-sent
```

## Utilisation
```ts
import Duplo, {zod} from "@duplojs/duplojs";
import duploWhatWasSent, {IHaveSentThis} from "@duplojs/what-was-sent";
import "@duplojs/what-was-sent/global"; //global import IHaveSentThis


const duplo = Duplo({port: 1506, host: "localhost", environment: "DEV"});

// this plugin is allow only in DEV environment
duplo.use(duploWhatWasSent);

duplo.declareRoute("GET", "/test/1")
.handler(
    ({}, res) => {
        res.code(200).send(100);
    },
    new IHaveSentThis(200, zod.string()) 
);

duplo.launch();
```