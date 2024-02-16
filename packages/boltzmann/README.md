# Boltzmann

## @samouraiwallet/boltzmann

This library is a Typescript port of the Java library - [boltzmann-java](https://github.com/Archive-Samourai-Wallet/boltzmann-java).

## Table of Contents
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
  - [CLI](#cli)
  - [Node.js](#nodejs)

## Requirements
- Node.js v18 or newer
- NPM (or yarn or pnpm)

## Installation
```shell
npm i @samouraiwallet/boltzmann
```

OR

```shell
pnpm add @samouraiwallet/boltzmann
```

OR
```shell
yarn add @samouraiwallet/boltzmann
```

## Usage

### CLI
See [@samouraiwallet/boltzmann-cli](../boltzmann-cli)

### Node.js

Boltzmann computation is CPU bound and blocking, so it is recommended to run it in a separate worker thread or dedicated process to prevent blocking of the main thread.

```typescript
import {Boltzmann, BoltzmannResult} from '@samouraiwallet/boltzmann';

// instantiate Boltzmann
const boltzmann = new Boltzmann({
  maxDuration: 30,
  maxTxos: 16,
  logLevel: "INFO"
});

// transaction object with entries for inputs and outputs
const transaction = {
  inputs: [
    ["address1", 1000],
    ["address2", 2000]
  ],
  outputs: [
    ["address3", 500],
    ["address4", 2200]
  ]
}

const result: BoltzmannResult = boltzmann.process(transaction);

console.log(result.toJSON());
/*
{
  nbCmbn: number,
  matLnkCombinations: number[][] | null,
  matLnkProbabilities: number[][] | null,
  entropy: number,
  dtrmLnksById: [number, number][],
  dtrmLnks: [string, string][],
  txos: {
    inputs: [string, number][],
    outputs: [string, number][],
  },
  fees: number,
  intraFees: {
    feesMaker: number,
    feesTaker: number,
    hasFees: boolean,
  },
  efficiency: number | null,
  nbCmbnPrfctCj: string | null,
  nbTxosPrfctCj: {
    nbIns: number
    nbOuts: number
  },
}
 */

```
