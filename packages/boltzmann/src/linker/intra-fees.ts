export class IntraFees {
	public readonly feesMaker: number;
	public readonly feesTaker: number;

	constructor(feesMaker: number, feesTaker: number) {
		this.feesMaker = feesMaker;
		this.feesTaker = feesTaker;
	}

	get hasFees(): boolean {
		return this.feesMaker > 0 || this.feesTaker > 0;
	}
}
