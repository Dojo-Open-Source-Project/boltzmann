export class TxosAggregatesData {
  txos: Map<string, number>;
  allAggIndexes: number[][]; // each entry value contains array of txos indexes for corresponding allAggVal[entry.key]
  allAggVal: number[];

  constructor(txos: Map<string, number>, allAggIndexes: number[][], allAggVal: number[]) {
    this.txos = txos;
    this.allAggIndexes = allAggIndexes;
    this.allAggVal = allAggVal;
  }

  getTxos(): Map<string, number> {
    return this.txos;
  }

  getAllAggIndexes(): number[][] {
    return this.allAggIndexes;
  }

  getAllAggVal(): number[] {
    return this.allAggVal;
  }
}
