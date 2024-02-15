import { TxosLinkerResult } from "../linker/TxosLinkerResult.js";
import { IntraFees } from "../linker/IntraFees.js";
import { NbTxos } from "./NbTxos.js";
import { Txos } from "../beans/Txos.js";

export class TxProcessorResult extends TxosLinkerResult {
  private readonly matLnkProbabilities: number[][] | null;
  private readonly entropy: number;
  private readonly fees: number;
  private readonly intraFees: IntraFees;
  private readonly efficiency: number | null;
  private readonly nbCmbnPrfctCj: bigint | null;
  private readonly nbTxosPrfctCj: NbTxos;

  constructor(
    nbCmbn: number,
    matLnkCombinations: number[][] | null,
    matLnkProbabilities: number[][] | null,
    entropy: number,
    dtrmLnksById: Set<Array<number>>,
    txos: Txos,
    fees: number,
    intraFees: IntraFees,
    efficiency: number | null,
    nbCmbnPrfctCj: bigint | null,
    nbTxosPrfctCj: NbTxos,
  ) {
    super(nbCmbn, matLnkCombinations, dtrmLnksById, txos);
    this.matLnkProbabilities = matLnkProbabilities;
    this.entropy = entropy;
    this.fees = fees;
    this.intraFees = intraFees;
    this.efficiency = efficiency;
    this.nbCmbnPrfctCj = nbCmbnPrfctCj;
    this.nbTxosPrfctCj = nbTxosPrfctCj;
  }

  getMatLnkProbabilities(): number[][] | null {
    return this.matLnkProbabilities;
  }

  getEntropy(): number {
    return this.entropy;
  }

  getFees(): number {
    return this.fees;
  }

  getIntraFees(): IntraFees {
    return this.intraFees;
  }

  getEfficiency(): number | null {
    return this.efficiency;
  }

  getNbCmbnPrfctCj(): bigint | null {
    return this.nbCmbnPrfctCj;
  }

  getNbTxosPrfctCj(): NbTxos {
    return this.nbTxosPrfctCj;
  }

  getNbLinks(): number {
    return this.getTxos().getInputs().size * this.getTxos().getOutputs().size;
  }

  getDensity(): number {
    return this.getEntropy() / (this.getTxos().getInputs().size + this.getTxos().getOutputs().size);
  }

  getNbDL(): number {
    return this.getDtrmLnksById().size;
  }

  getRatioDL(): number {
    return this.getNbDL() / this.getNbLinks();
  }

  getNRatioDL(): number {
    return 1 - this.getRatioDL();
  }
}
