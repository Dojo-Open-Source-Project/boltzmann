export class NbTxos {
  private readonly nbIns: number;
  private readonly nbOuts: number;

  constructor(nbIns: number, nbOuts: number) {
    this.nbIns = nbIns;
    this.nbOuts = nbOuts;
  }

  public getNbIns(): number {
    return this.nbIns;
  }

  public getNbOuts(): number {
    return this.nbOuts;
  }
}
