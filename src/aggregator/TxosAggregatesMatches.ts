export class TxosAggregatesMatches {
  constructor(
    private allMatchInAgg: number[],
    private matchInAggToVal: Map<number, number>,
    private valToMatchOutAgg: Map<number, number[]>,
  ) {}

  public getAllMatchInAgg(): number[] {
    return this.allMatchInAgg;
  }

  public getMatchInAggToVal(): Map<number, number> {
    return this.matchInAggToVal;
  }

  public getValToMatchOutAgg(): Map<number, number[]> {
    return this.valToMatchOutAgg;
  }
}
