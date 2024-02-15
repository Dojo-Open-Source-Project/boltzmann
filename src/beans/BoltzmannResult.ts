import { TxProcessorResult } from "../processor/TxProcessorResult.js";
import { Txos } from "./Txos.js";
import { Utils } from "../utils/Utils.js";

export class BoltzmannResult extends TxProcessorResult {
  dtrmLnks: string[][];
  duration: number;

  constructor(duration: number, r: TxProcessorResult) {
    super(
      r.getNbCmbn(),
      r.getMatLnkCombinations(),
      r.getMatLnkProbabilities(),
      r.getEntropy(),
      r.getDtrmLnksById(),
      r.getTxos(),
      r.getFees(),
      r.getIntraFees(),
      r.getEfficiency(),
      r.getNbCmbnPrfctCj(),
      r.getNbTxosPrfctCj(),
    );
    this.dtrmLnks = r.getDtrmLnksById() == null ? [[""]] : this.replaceDtrmLinks(r.getDtrmLnksById(), r.getTxos());
    this.duration = duration;
  }

  private replaceDtrmLinks(dtrmLinks: Set<number[]>, txos: Txos): string[][] {
    const result: string[][] = Array.from<string[]>({ length: dtrmLinks.size }).fill([]);

    const outs: string[] = [...txos.getOutputs().keys()];
    const ins: string[] = [...txos.getInputs().keys()];

    let i: number = 0;
    dtrmLinks.forEach((dtrmLink) => {
      const out = outs[dtrmLink[0]];
      const n = ins[dtrmLink[1]];
      result[i] = [out, n];
      i++;
    });

    return result;
  }

  public getDtrmLnks(): string[][] {
    return this.dtrmLnks;
  }

  public getDuration() {
    return this.duration;
  }

  public print(): void {
    console.log(`Inputs = ${JSON.stringify(Object.fromEntries(this.getTxos().getInputs().entries()))}`);
    console.log(`Outputs = ${JSON.stringify(Object.fromEntries(this.getTxos().getOutputs().entries()))}`);
    console.log(`Fees = ${this.getFees()} satoshis`);

    if (this.getIntraFees() != null && this.getIntraFees().getFeesMaker() > 0 && this.getIntraFees().getFeesTaker() > 0) {
      console.log(`Hypothesis: Max intrafees received by a participant = ${this.getIntraFees().getFeesMaker()} satoshis`);
      console.log(`Hypothesis: Max intrafees paid by a participant = ${this.getIntraFees().getFeesTaker()} satoshis`);
    }

    if (this.getNbCmbnPrfctCj() != null) {
      console.log(
        `Perfect coinjoin = ${this.getNbCmbnPrfctCj()} combinations (for ${this.getNbTxosPrfctCj().getNbIns()}x${this.getNbTxosPrfctCj().getNbOuts()})`,
      );
    }
    console.log(`Nb combinations = ${this.getNbCmbn()}`);

    if (this.getEntropy() != null) {
      console.log(`Tx entropy = ${this.getEntropy()} bits`);
      console.log(`Entropy density = ${this.getDensity()}`);
    }

    if (this.getEfficiency() != null) {
      console.log(`Wallet efficiency = ${(this.getEfficiency() ?? 0) * 100}% (${Math.log2(this.getEfficiency() ?? 0)} bits)`);
    }

    if (this.getMatLnkCombinations() == null) {
      if (this.getNbCmbn() === 0) {
        console.log("Skipped processing of this transaction (too many inputs and/or outputs)");
      }
    } else {
      if (this.getMatLnkProbabilities() != null) {
        console.log("Linkability Matrix (probabilities):");
        console.log(JSON.stringify(this.getMatLnkProbabilities()));
      }
      if (this.getMatLnkCombinations() != null) {
        console.log("Linkability Matrix (#combinations with link):");
        console.log(JSON.stringify(this.getMatLnkCombinations()));
      }
    }

    if (this.getDtrmLnks() == null) {
      console.log("Deterministic links: all");
    } else if (this.getDtrmLnks().length > 0) {
      console.log("Deterministic links:");
      const readableDtrmLnks = this.getDtrmLnks();
      for (const dtrmLink of readableDtrmLnks) {
        const output = dtrmLink[0];
        const input = dtrmLink[1];
        console.log(`${input} & ${output} are deterministically linked`);
      }
    } else {
      console.log("Deterministic links: none");
    }

    console.log("Benchmarks:");

    const benchmarks: any[] = [];

    benchmarks.push(["duration", this.duration]);
    console.log(`Duration = ${Utils.duration(this.duration)}`);

    const maxMem = Utils.getMaxMemUsed();
    benchmarks.push(["maxMem", maxMem]);
    console.log(`Max mem used: ${maxMem}M`);

    for (const progress of Utils.getProgressResult()) {
      console.log(progress.getResult());
      benchmarks.push([progress.getName(), progress.getTarget(), progress.computeElapsed() / 1000, progress.getRate(), progress.getMsg()]);
    }

    const exportObj: any = {};
    exportObj.ins = Object.fromEntries(this.getTxos().getInputs().entries());
    exportObj.outs = Object.fromEntries(this.getTxos().getOutputs().entries());
    exportObj.nbCmbn = this.getNbCmbn();
    exportObj.mat = this.getMatLnkCombinations() == null ? null : JSON.stringify(this.getMatLnkCombinations());

    exportObj.benchmarks = benchmarks;

    try {
      const exportStr = JSON.stringify(exportObj);
      console.log(`Export: ${exportStr}`);
    } catch (error) {
      console.error(error);
    }
  }
}
