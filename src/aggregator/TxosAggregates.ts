import { TxosAggregatesData } from "./TxosAggregatesData.js";

export class TxosAggregates {
  private readonly inAgg: TxosAggregatesData;
  private readonly outAgg: TxosAggregatesData;

  constructor(inAgg: TxosAggregatesData, outAgg: TxosAggregatesData) {
    this.inAgg = inAgg;
    this.outAgg = outAgg;
  }

  public getInAgg() {
    return this.inAgg;
  }

  public getOutAgg() {
    return this.outAgg;
  }
}
