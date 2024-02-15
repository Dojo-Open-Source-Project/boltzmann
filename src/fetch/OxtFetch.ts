import * as fs from "fs/promises";
import os from "os";
import path from "path";

import { Txos } from "../beans/Txos.js";

const resourceDir = path.join(os.tmpdir(), "boltzmann-fetchTx");

export class OxtFetch {
  async fetch(txid: string): Promise<Txos> {
    const ins0 = new Map<string, number>();
    const outs0 = new Map<string, number>();

    let obj;

    // create resource directory if it doesn't exist already
    await fs.access(resourceDir, fs.constants.F_OK).catch(() => fs.mkdir(resourceDir));

    const resourcePath = path.join(resourceDir, `${txid}.json`);
    const exists = await fs.access(resourcePath, fs.constants.R_OK).then(
      () => true,
      () => false,
    );

    if (exists) {
      // Read from local file.
      const data = await fs.readFile(resourcePath, { encoding: "utf8" });
      obj = JSON.parse(data);
      console.log(`# Read local file for ${txid}:`);
    } else {
      // Read fetch.
      const url = `https://api.oxt.me/txs/${txid}?boltzmann-javascript`;

      const response = await fetch(url);

      if (response.ok) {
        console.log(`# Fetched ${txid}:`);
        obj = await response.json();
        fs.writeFile(resourcePath, JSON.stringify(obj), { encoding: "utf8" });
      } else {
        throw new Error(`Transaction not found: ${txid}`);
      }
    }

    const dataObj = obj.data[0];

    const inputs = dataObj.ins;
    for (const input of inputs) {
      const value = input.amount;
      ins0.set(input.addresses[0].value, value);
    }

    const outputs = dataObj.outs;
    for (const output of outputs) {
      const value = output.amount;
      outs0.set(output.addresses[0].value, value);
    }

    const txos = new Txos(ins0, outs0);
    console.log(`${txos.getInputs().size} inputs: ${JSON.stringify(Object.fromEntries(txos.getInputs().entries()))}`);
    console.log(`${txos.getOutputs().size} outputs: ${JSON.stringify(Object.fromEntries(txos.getOutputs().entries()))}`);

    return txos;
  }
}
