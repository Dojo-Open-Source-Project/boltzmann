export class IntraFees {
  private readonly feesMaker: number;
  private readonly feesTaker: number;
  private readonly _hasFees: boolean;

  constructor(feesMaker: number, feesTaker: number) {
    this.feesMaker = feesMaker;
    this.feesTaker = feesTaker;
    this._hasFees = feesMaker > 0 || feesTaker > 0;
  }

  public getFeesMaker(): number {
    return this.feesMaker;
  }

  public getFeesTaker(): number {
    return this.feesTaker;
  }

  public hasFees(): boolean {
    return this._hasFees;
  }
}
