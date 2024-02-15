export class CoinjoinPattern {
  private readonly nbPtcpts: number;
  private readonly cjAmount: number;

  constructor(nbPtcpts: number, cjAmount: number) {
    this.nbPtcpts = nbPtcpts;
    this.cjAmount = cjAmount;
  }

  public getNbPtcpts(): number {
    return this.nbPtcpts;
  }

  public getCjAmount(): number {
    return this.cjAmount;
  }
}
