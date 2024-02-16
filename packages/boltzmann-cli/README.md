# Boltzmann CLI

## @samouraiwallet/boltzmann-cli

This is a CLI tool for users that want to run [Boltzmann](../boltzmann) locally in terminal

## Requirements
- Node.js v18 or newer
- NPM (or yarn or pnpm)

## Installation
```shell
# install globally
npm i -g @samouraiwallet/boltzmann-cli
```

## Usage

### Node.js

See [@samouraiwallet/boltzmann](../boltzmann)

### CLI

Current version does not support fetching transaction information from Bitcoin RPC.

You must choose remote API to fetch transaction information from (blockstream.info or mempool.space).

It is recommended to use Tor socks proxy to anonymize your requests.

```shell
# when installed via NPM globally

boltzmann --maxDuration <number> --maxTxos <number> --txId <transactionID> --api <api> --socks <host>:<port>

# OR using NPX

npx @samouraiwallet/boltzmann-cli@latest --maxDuration <number> --maxTxos <number> --txId <transactionID> --api <api> --socks <host>:<port>

--version          Show version number            [boolean]
-m, --maxDuration  Max duration in seconds        [number] [default: Infinity]
-x, --maxTxos      Max number of txos             [number] [default: Infinity]
-i, --intraFees    Max infrafees ratio            [number] [default: 0.005]
-l, --linkerOpts   Linker options [array] [choices: "PRECHECK", "LINKABILITY", "MERGE_FEES", "MERGE_INPUTS", "MERGE_OUTPUTS"]
-t, --txId         Transaction ID                 [string] [required]
-a, --api          Source API   [required] [choices: "mempool", "blockstream"]
-s, --socks        Connection string to socks proxy. Must be of the form <host>:<port> [string]
--debug            Enable debug mode              [boolean]
--help             Show help                      [boolean]
 ```
