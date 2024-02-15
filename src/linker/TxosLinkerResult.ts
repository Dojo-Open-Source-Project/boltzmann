import { TxosAggregatorResult } from "../aggregator/TxosAggregatorResult.js";
import { Txos } from "../beans/Txos.js";

export class TxosLinkerResult extends TxosAggregatorResult {
  private readonly dtrmLnksById: Set<number[]>;
  private readonly txos: Txos;

  constructor(nbCmbn: number, matLnk: number[][] | null, dtrmLnksById: Set<number[]>, txos: Txos) {
    super(nbCmbn, matLnk);
    this.dtrmLnksById = dtrmLnksById;
    this.txos = txos;
  }

  public getDtrmLnksById(): Set<number[]> {
    return this.dtrmLnksById;
  }

  public getTxos(): Txos {
    return this.txos;
  }
}
