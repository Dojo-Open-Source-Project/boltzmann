import Big from "big.js";

import { TxProcessorResult } from "./TxProcessorResult.js";
import { Txos } from "../beans/Txos.js";
import { TxosLinkerOptionEnum } from "../linker/TxosLinkerOptionEnum.js";
import { TxProcessorConst } from "./TxProcessorConst.js";
import { ListsUtils } from "../utils/ListsUtils.js";
import { FilteredTxos } from "./FilteredTxos.js";
import { IntraFees } from "../linker/IntraFees.js";
import { TxosLinkerResult } from "../linker/TxosLinkerResult.js";
import { TxosLinker } from "../linker/TxosLinker.js";
import { CoinjoinPattern } from "./CoinjoinPattern.js";
import { NbTxos } from "./NbTxos.js";

export class TxProcessor {
  //private static final Logger log = LoggerFactory.getLogger(TxProcessor.class);

  private readonly maxDuration: number;
  private readonly maxTxos: number;

  constructor(maxDuration: number, maxTxos: number) {
    this.maxDuration = maxDuration;
    this.maxTxos = maxTxos;
  }

  /**
   * Processes a transaction
   *
   * @param txos Txos to be processed
   * @param maxCjIntrafeesRatio maxCjIntrafeesRatio max intrafees paid by the taker of a coinjoined
   *     transaction. Expressed as a percentage of the coinjoined amount
   * @param linkerOptions linkerOptions options to be applied during processing
   * @return TxProcessorResult
   */
  public processTx(txos: Txos, maxCjIntrafeesRatio: number, linkerOptions: TxosLinkerOptionEnum[]): TxProcessorResult {
    const options = new Set<TxosLinkerOptionEnum>(linkerOptions);

    /*
    if (log.isDebugEnabled()) {
      log.debug(
          "Processing tx: "
              + txos.getInputs().size()
              + " inputs, "
              + txos.getOutputs().size()
              + " outputs");
    }
     */

    // Builds lists of filtered input/output txos (with generated ids)
    const filteredIns = this.filterTxos(txos.getInputs(), TxProcessorConst.MARKER_INPUT);
    const filteredOuts = this.filterTxos(txos.getOutputs(), TxProcessorConst.MARKER_OUTPUT);

    // Computes total input & output amounts + fees
    const sumInputs = [...filteredIns.getTxos().values()].reduce((prev, curr) => prev + curr, 0);
    const sumOutputs = [...filteredOuts.getTxos().values()].reduce((prev, curr) => prev + curr, 0);
    const fees = sumInputs - sumOutputs;

    // Sets default intrafees paid by participants (fee_received_by_maker, fees_paid_by_taker)
    let intraFees = new IntraFees(0, 0);

    let result: TxosLinkerResult;

    // Processes the transaction
    if (filteredIns.getTxos().size <= 1 || filteredOuts.getTxos().size === 1) {
      // Txs having no input (coinbase) or only 1 input/output (null entropy)
      // When entropy = 0, all inputs and outputs are linked and matrix is filled with 1.
      // No need to build this matrix. Every caller should be able to manage that.
      result = new TxosLinkerResult(1, [], new Set(), new Txos(filteredIns.getTxos(), filteredOuts.getTxos()));
    } else {
      // Initializes the TxosLinker for this tx
      const filteredTxos = new Txos(filteredIns.getTxos(), filteredOuts.getTxos());
      const linker = new TxosLinker(fees, this.maxDuration, this.maxTxos);

      // Computes a list of sets of inputs controlled by a same address
      let linkedIns: Set<string>[] = [];
      let linkedOuts: Set<string>[] = [];

      if (options.has(TxosLinkerOptionEnum.MERGE_INPUTS)) {
        // Computes a list of sets of inputs controlled by a same address
        linkedIns = this.getLinkedTxos(filteredIns);
      }

      if (options.has(TxosLinkerOptionEnum.MERGE_OUTPUTS)) {
        // Computes a list of sets of outputs controlled by a same address (not recommended)
        linkedOuts = this.getLinkedTxos(filteredOuts);
      }

      // Computes intrafees to be used during processing
      if (maxCjIntrafeesRatio > 0) {
        // Computes a theoretic max number of participants
        const lsFilteredIns: Set<string>[] = [];
        for (const txoId of filteredIns.getTxos().keys()) {
          const set = new Set<string>();
          set.add(txoId);
          lsFilteredIns.push(set);
        }

        lsFilteredIns.push(...linkedIns);
        const insToMerge: Set<string>[] = [];
        insToMerge.push(...lsFilteredIns, ...linkedIns);
        const maxNbPtcpts = ListsUtils.mergeSets(insToMerge).length;

        // Checks if tx has a coinjoin pattern + gets estimated number of participants and
        // coinjoined amount
        const cjPattern = this.checkCoinjoinPattern(filteredOuts.getTxos(), maxNbPtcpts);

        // If coinjoin pattern detected, computes theoretic max intrafees
        if (cjPattern != null) {
          intraFees = this.computeCoinjoinIntrafees(cjPattern.getNbPtcpts(), cjPattern.getCjAmount(), maxCjIntrafeesRatio);
        }
      }

      // Computes entropy of the tx and txos linkability matrix
      const linkedTxos: Set<string>[] = [];
      linkedTxos.push(...linkedIns, ...linkedOuts);
      result = linker.process(filteredTxos, linkedTxos, options, intraFees);
    }

    // compute nb_cmbn_perfect_cj
    const nbTxosPrfctCj = this.getClosestPerfectCoinjoin(filteredIns.getTxos().size, filteredOuts.getTxos().size);
    const nbCmbnPrfctCj = this.computeCmbnsPerfectCj(nbTxosPrfctCj.getNbIns(), nbTxosPrfctCj.getNbOuts());
    // Computes tx efficiency (expressed as the ratio: nb_cmbn/nb_cmbn_perfect_cj)
    let efficiency: number | null = null;
    if (nbCmbnPrfctCj != null) {
      efficiency = this.computeWalletEfficiency(result.getNbCmbn(), nbCmbnPrfctCj);
    }

    // Post processes results (replaces txo ids by bitcoin addresses)

    const txoIns = this.postProcessTxos(result.getTxos().getInputs(), filteredIns.getMapIdAddr());
    const txoOuts = this.postProcessTxos(result.getTxos().getOutputs(), filteredOuts.getMapIdAddr());
    return new TxProcessorResult(
      result.getNbCmbn(),
      result.getMatLnkCombinations(),
      result.computeMatLnkProbabilities(),
      result.computeEntropy(),
      result.getDtrmLnksById(),
      new Txos(txoIns, txoOuts),
      fees,
      intraFees,
      efficiency,
      nbCmbnPrfctCj,
      nbTxosPrfctCj,
    );
  }

  /**
   * Computes a list of sets of txos controlled by a same address Returns a list of sets of txo_ids
   * [ {txo_id1, txo_id2, ...}, {txo_id3, txo_id4, ...} ]
   *
   * @param filteredTxos FilteredTxos
   */
  private getLinkedTxos(filteredTxos: FilteredTxos): Array<Set<string>> {
    const linkedTxos: Set<string>[][] = [];

    for (const id of filteredTxos.getTxos().keys()) {
      let setIns: Set<string> = new Set();
      setIns.add(id);

      let setAddr: Set<string> = new Set();
      setAddr.add(filteredTxos.getMapIdAddr().get(id)!);

      for (let i = 0; i < linkedTxos.length; i++) {
        const [k, v] = linkedTxos[i];
        if ([...k].some((addr) => setAddr.has(addr))) {
          setIns = new Set([...setIns, ...v]);
          setAddr = new Set([...setAddr, ...k]);
          linkedTxos.splice(i, 1); //removes the intersecting entry
          i--;
        }
      }

      linkedTxos.push([setAddr, setIns]);
    }

    const result: Set<string>[] = [];
    for (const sets of linkedTxos) {
      if (sets[1].size > 1) {
        result.push(sets[1]);
      }
    }

    return result;
  }

  /**
   * Filters a list of txos by removing txos with null value (OP_RETURN, ...). Defines an id for
   * each txo
   *
   * @param txos list of Txo objects
   * @param prefix a prefix to be used for ids generated
   * @return FilteredTxos
   */
  private filterTxos(txos: Map<string, number>, prefix: string): FilteredTxos {
    const filteredTxos = new Map<string, number>();
    const mapIdAddr = new Map<string, string>();

    for (const entry of txos.entries()) {
      if (entry[1] > 0) {
        const txoId = prefix + mapIdAddr.size;
        filteredTxos.set(txoId, entry[1]);
        mapIdAddr.set(txoId, entry[0]);
      }
    }

    return new FilteredTxos(filteredTxos, mapIdAddr);
  }

  /**
   * Post processes a list of txos Basically replaces txo_id by associated bitcoin address Returns a
   * list of txos (tuples (address, amount))
   *
   * @param txos list of txos (tuples (txo_id, amount))
   * @param mapIdAddr mapping txo_ids to addresses
   */
  public postProcessTxos(txos: Map<string, number>, mapIdAddr: Map<string, string>): Map<string, number> {
    const results = new Map<string, number>();
    for (const entry of txos.entries()) {
      if (entry[0].startsWith(TxProcessorConst.MARKER_INPUT) || entry[0].startsWith(TxProcessorConst.MARKER_OUTPUT)) {
        results.set(mapIdAddr.get(entry[0])!, entry[1]);
      } else {
        results.set(entry[0], entry[1]); // PACKS, FEES...
      }
    }
    return results;
  }

  /**
   * Checks if a transaction looks like a coinjoin Returns a tuple (is_coinjoin, nb_participants,
   * coinjoined_amount)
   *
   * @param txoOuts list of outputs valves (tuples (tiid, amount))
   * @param maxNbEntities estimated max number of entities participating in the coinjoin (info
   *     coming from a side channel source or from an analysis of tx structure)
   * @return CoinjoinPattern if coinjoin pattern is found, otherwise null
   */
  protected checkCoinjoinPattern(txoOuts: Map<string, number>, maxNbEntities: number): CoinjoinPattern | null {
    // Checks that we have more than 1 input entity
    if (maxNbEntities < 2) {
      return null;
    }

    // Computes a dictionary of #outputs per amount (d[amount] = nb_outputs)
    const nbOutsByAmount = new Map<number, number>();
    for (const entry of txoOuts.entries()) {
      const amont = entry[1];
      let nb = nbOutsByAmount.get(amont) ?? 0;
      nb++;
      nbOutsByAmount.set(amont, nb);
    }

    // Computes #outputs
    const nbTxoOuts = txoOuts.size;

    // Tries to detect a coinjoin pattern in outputs:
    //   n outputs with same value, with n > 1
    //   nb_outputs <= 2*nb_ptcpts (with nb_ptcpts = min(n, max_nb_entities) )
    // If multiple candidate values
    // selects option with max number of participants (and max amount as 2nd criteria)
    let isCj = false;
    let resNbPtcpts = 0;
    let resAmount = 0;
    for (const entry of nbOutsByAmount.entries()) {
      const amount = entry[0];
      const nbOutsForAmount = entry[1];
      if (nbOutsForAmount > 1) {
        const maxNbPtcpts = Math.min(nbOutsForAmount, maxNbEntities);
        const condTxoOuts = nbTxoOuts <= 2 * maxNbPtcpts;
        const condMaxPtcpts = maxNbPtcpts >= resNbPtcpts;
        const condMaxAmount = amount > resAmount;
        if (condTxoOuts && condMaxPtcpts && condMaxAmount) {
          isCj = true;
          resNbPtcpts = maxNbPtcpts;
          resAmount = amount;
        }
      }
    }
    if (!isCj) {
      return null;
    }
    return new CoinjoinPattern(resNbPtcpts, resAmount);
  }

  /**
   * Computes theoretic intrafees involved in a coinjoin transaction (e.g. joinmarket)
   *
   * @param nbPtcpts number of participants
   * @param cjAmount common amount generated for the coinjoin transaction
   * @param prctMax max percentage paid by the taker to all makers
   * @return IntraFees
   */
  protected computeCoinjoinIntrafees(nbPtcpts: number, cjAmount: number, prctMax: number): IntraFees {
    const feeMaker = Math.round(cjAmount * prctMax);
    const feeTaker = feeMaker * (nbPtcpts - 1);
    return new IntraFees(feeMaker, feeTaker);
  }

  /**
   * Computes the efficiency of a transaction defined by: - its number of inputs - its number of
   * outputs - its entropy (expressed as number of combinations)
   *
   * @param nbCmbn number of combinations found for the transaction
   * @param nbCmbnPrfctCj number of combinations for perfect CJ
   * @return an efficiency score computed as the ratio: nb_cmbn / nb_cmbn_closest_perfect_coinjoin
   */
  private computeWalletEfficiency(nbCmbn: number, nbCmbnPrfctCj: bigint): number {
    if (nbCmbn === 1) {
      return 0;
    }

    return new Big(nbCmbn).div(new Big(nbCmbnPrfctCj.toString())).toNumber();
  }

  /**
   * Computes the structure of the closest perfect coinjoin for a transaction defined by its #inputs
   * and #outputs
   *
   * <p>A perfect coinjoin is defined as a transaction for which: - all inputs have the same amount
   * - all outputs have the same amount - 0 fee are paid (equiv. to same fee paid by each input) -
   * nb_i % nb_o == 0, if nb_i >= nb_o or nb_o % nb_i == 0, if nb_o >= nb_i
   *
   * <p>Returns a tuple (nb_i, nb_o) for the closest perfect coinjoin
   *
   * @param nbIns number of inputs of the transaction
   * @param nbOuts number of outputs of the transaction
   * @return
   */
  private getClosestPerfectCoinjoin(nbIns: number, nbOuts: number): NbTxos {
    if (nbIns > nbOuts) {
      // Reverses inputs and outputs
      const nbInsInitial = nbIns;
      nbIns = nbOuts;
      nbOuts = nbInsInitial;
    }

    if (nbOuts % nbIns === 0) {
      return new NbTxos(nbIns, nbOuts);
    }
    const tgtRatio = Math.floor(1 + nbOuts / nbIns);
    return new NbTxos(nbIns, nbIns * tgtRatio);
  }

  /**
   * Computes the number of combinations for a perfect coinjoin with nb_i inputs and nb_o outputs.
   *
   * <p>A perfect coinjoin is defined as a transaction for which: - all inputs have the same amount
   * - all outputs have the same amount - 0 fee are paid (equiv. to same fee paid by each input) -
   * nb_i % nb_o == 0, if nb_i >= nb_o or nb_o % nb_i == 0, if nb_o >= nb_i
   *
   * <p>Notes: Since all inputs have the same amount we can use exponential Bell polynomials to
   * retrieve the number and structure of partitions for the set of inputs.
   *
   * <p>Since all outputs have the same amount we can use a direct computation of combinations of k
   * outputs among n.
   *
   * @param nbIns number of inputs
   * @param nbOuts number of outputs
   * @return the number of combinations
   */
  private computeCmbnsPerfectCj(nbIns: number, nbOuts: number): bigint | null {
    if (nbIns > nbOuts) {
      // Reverses inputs and outputs
      const nbInsInitial = nbIns;
      nbIns = nbOuts;
      nbOuts = nbInsInitial;
    }

    if (nbOuts % nbIns !== 0) {
      return null;
    }

    // Checks if we can use precomputed values
    if (nbIns <= 1 || nbOuts <= 1) {
      return 1n;
    } else if (nbIns <= 20 && nbOuts <= 60) {
      return TxProcessorConst.getNbCmbnPrfctCj(nbIns, nbOuts) || null; // Check this method
    }

    return null;
  }
}
