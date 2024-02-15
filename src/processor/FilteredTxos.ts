export class FilteredTxos {
  private readonly txos: Map<string, number>;
  private readonly mapIdAddr: Map<string, string>;

  constructor(txos: Map<string, number>, mapIdAddr: Map<string, string>) {
    this.txos = txos;
    this.mapIdAddr = mapIdAddr;
  }

  public getTxos(): Map<string, number> {
    return this.txos;
  }

  public getMapIdAddr(): Map<string, string> {
    return this.mapIdAddr;
  }
}
