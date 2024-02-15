import { Txos } from "../beans/Txos.js";

export class UnpackLinkMatrixResult {
  private readonly txos: Txos;
  private readonly matLnk: number[][];

  constructor(txos: Txos, matLnk: number[][]) {
    this.txos = txos;
    this.matLnk = matLnk;
  }

  public getTxos(): Txos {
    return this.txos;
  }

  public getMatLnk(): number[][] {
    return this.matLnk;
  }
}
