import { TxosAggregates } from "./TxosAggregates.js";
import { TxosAggregatesMatches } from "./TxosAggregatesMatches.js";
import { TxosAggregatorResult } from "./TxosAggregatorResult.js";
import { Txos } from "../beans/Txos.js";
import { IntraFees } from "../linker/IntraFees.js";

class ComputeLinkMatrixTask {
  private idxIl: number;
  private readonly il: number;
  private readonly ir: number;
  private readonly dOut: Map<number, Map<number, number[]>>;

  constructor(idxIl: number, il: number, ir: number, dOut: Map<number, Map<number, number[]>>) {
    this.idxIl = idxIl;
    this.il = il;
    this.ir = ir;
    this.dOut = dOut;
  }

  public getIdxIl() {
    return this.idxIl;
  }

  public setIdxIl(idxIl: number) {
    this.idxIl = idxIl;
  }

  public getIl() {
    return this.il;
  }

  public getIr() {
    return this.ir;
  }

  public getdOut() {
    return this.dOut;
  }
}

export class TxosAggregator {
  //private static final Logger log = LoggerFactory.getLogger(TxosAggregator.class);

  /**
   * Matches input/output aggregates by values and returns a bunch of data structs
   *
   * @param allAgg
   * @param fees
   * @param intraFees
   * @return
   */
  public matchAggByVal(allAgg: TxosAggregates, fees: number, intraFees: IntraFees): TxosAggregatesMatches {
    const allInAggVal: number[] = allAgg.getInAgg().getAllAggVal();
    const allOutAggVal: number[] = allAgg.getOutAgg().getAllAggVal();

    const allUniqueInAggVal: number[] = [...new Set(allInAggVal)].sort((a, b) => a - b);
    const allUniqueOutAggVal: number[] = [...new Set(allOutAggVal)].sort((a, b) => a - b);

    const allMatchInAgg: number[] = [];
    const matchInAggToVal: Map<number, number> = new Map<number, number>();
    const valToMatchOutAgg: Map<number, number[]> = new Map<number, number[]>();

    const hasIntraFees: boolean = intraFees != null && intraFees.hasFees();
    const feesTaker: number = hasIntraFees ? fees + intraFees.getFeesTaker() : 0;
    const feesMaker: number = hasIntraFees ? -intraFees.getFeesMaker() : 0;

    for (let i = 0; i < allUniqueInAggVal.length; i++) {
      const inAggVal: number = allUniqueInAggVal[i];
      for (let j = 0; j < allUniqueOutAggVal.length; j++) {
        const outAggVal: number = allUniqueOutAggVal[j];
        const diff: number = inAggVal - outAggVal;

        if (!hasIntraFees && diff < 0) {
          break;
        } else {
          const condNoIntrafees: boolean = !hasIntraFees && diff <= fees;
          const condIntraFees: boolean = hasIntraFees && ((diff <= 0 && diff >= feesMaker) || (diff >= 0 && diff <= feesTaker));

          if (condNoIntrafees || condIntraFees) {
            for (let inIdx = 0; inIdx < allInAggVal.length; inIdx++) {
              if (allInAggVal[inIdx] == inAggVal) {
                if (!allMatchInAgg.includes(inIdx)) {
                  allMatchInAgg.push(inIdx);
                  matchInAggToVal.set(inIdx, inAggVal);
                }
              }
            }

            if (!valToMatchOutAgg.has(inAggVal)) {
              valToMatchOutAgg.set(inAggVal, [] as number[]);
            }
            const keysMatchOutAgg: number[] = valToMatchOutAgg.get(inAggVal)!;

            for (let idx = 0; idx < allOutAggVal.length; idx++) {
              if (allOutAggVal[idx] === outAggVal) {
                keysMatchOutAgg.push(idx);
              }
            }
          }
        }
      }
    }

    return new TxosAggregatesMatches(allMatchInAgg, matchInAggToVal, valToMatchOutAgg);
  }

  /**
   * Computes a matrix of valid combinations (pairs) of input aggregates Returns a dictionary
   * (parent_agg => (child_agg1, child_agg2)) We have a valid combination (agg1, agg2) if: R1/
   * child_agg1 & child_agg2 = 0 (no bitwise overlap) R2/ child_agg1 > child_agg2 (matrix is
   * symmetric)
   */
  public computeInAggCmbn(aggMatches: TxosAggregatesMatches): Map<number, number[][]> {
    const aggs: number[] = [...aggMatches.getAllMatchInAgg()];
    aggs.shift();

    const mat: Map<number, number[][]> = new Map<number, number[][]>();
    if (aggs.length > 0) {
      const tgt: number = aggs.pop() || 0;

      for (let i = 0; i <= tgt; i++) {
        if (aggs.includes(i)) {
          const jMax: number = Math.min(i, tgt - i + 1);

          for (let j = 0; j < jMax; j++) {
            if ((i & j) === 0 && aggs.includes(j)) {
              const aggChilds: number[][] = this.createLine(mat, i + j);
              aggChilds.push([i, j]);
            }
          }
        }
      }
    }
    return mat;
  }

  private createLine(mat: Map<number, number[][]>, i: number): number[][] {
    let line = mat.get(i);
    if (!line) {
      line = [];
      mat.set(i, line);
    }
    return line;
  }

  /**
   * Checks the existence of deterministic links between inputs and outputs
   *
   * @return list of deterministic links as tuples (idx_output, idx_input)
   */
  public checkDtrmLinks(txos: Txos, allAgg: TxosAggregates, aggMatches: TxosAggregatesMatches): Set<number[]> {
    const nbIns: number = txos.getInputs().size;
    const nbOuts: number = txos.getOutputs().size;

    const matCmbn: number[][] = Array.from(new Array(nbOuts), () => new Array(nbIns).fill(0));
    const inCmbn: number[] = new Array(nbIns).fill(0);

    [...aggMatches.getMatchInAggToVal().entries()].forEach((inEntry: [number, number]) => {
      const inIdx: number = inEntry[0];
      const val: number = inEntry[1];
      const outIdxArr: number[] = aggMatches.getValToMatchOutAgg().get(val)!;

      outIdxArr.forEach((outIdx: number) => {
        this.updateLinkCmbn(matCmbn, inIdx, outIdx, allAgg);

        const inIndexes: number[] = allAgg.getInAgg().getAllAggIndexes()[inIdx];
        inIndexes.forEach((inIndex: number) => {
          const currentValue: number = inCmbn[inIndex];
          inCmbn[inIndex] = currentValue + 1;
        });
      });
    });

    const nbCmbn: number = inCmbn[0];
    return this.findDtrmLinks(matCmbn, nbCmbn);
  }

  /**
   * Computes the linkability matrix Returns the number of possible combinations and the links
   * matrix Implements a depth-first traversal of the inputs combinations tree (right to left) For
   * each input combination we compute the matching output combinations. This is a basic brute-force
   * solution. Will have to find a better method later.
   *
   */
  public computeLinkMatrix(
    txos: Txos,
    allAgg: TxosAggregates,
    aggMatches: TxosAggregatesMatches,
    matInAggCmbn: Map<number, number[][]>,
    maxDuration: number,
  ): TxosAggregatorResult {
    let nbTxCmbn = 0;
    const itGt: number = Math.pow(2, txos.getInputs().size) - 1;
    const otGt: number = Math.pow(2, txos.getOutputs().size) - 1;

    const dLinks = new Map<number, Map<number, number>>();
    const dOutInitial = new Map<number, Map<number, number[]>>();
    const dOutEntry = new Map<number, number[]>();
    dOutEntry.set(0, [1, 0]);
    dOutInitial.set(otGt, dOutEntry);

    const stack: Array<ComputeLinkMatrixTask> = [];

    const rootTask = new ComputeLinkMatrixTask(0, 0, itGt, dOutInitial);
    stack.push(rootTask);
    const rootIrcs = matInAggCmbn.get(rootTask.getIr());
    const rootLenIrcs = rootIrcs ? rootIrcs.length : 0;

    const startTime = Date.now();

    let totalIterations = 0;
    let iterations = 0;
    while (stack.length > 0) {
      const currTime = Date.now();
      const deltaTimeSeconds = (currTime - startTime) / 1000;

      if (maxDuration && deltaTimeSeconds >= maxDuration) {
        console.log("maxDuration limit reached!");
        return new TxosAggregatorResult(0, []);
      }

      let t = stack.at(-1)!;
      let nIdxIl = t.getIdxIl();

      const ircs: number[][] = matInAggCmbn.get(t.getIr())!;
      const lenIrcs: number = ircs ? ircs.length : 0;

      for (let i = t.getIdxIl(); i < lenIrcs; i++) {
        iterations++;
        nIdxIl = i;
        const nIl = ircs[i][1];

        if (nIl > t.getIl()) {
          const nIr = ircs[i][0];
          iterations++;
          const ndOut = this.runTask(nIl, nIr, aggMatches, otGt, t.getdOut());
          t.setIdxIl(i + 1);
          iterations++;

          stack.push(new ComputeLinkMatrixTask(0, nIl, nIr, ndOut));
          const newIrcs: number[][] | undefined = matInAggCmbn.get(nIr);
          const newLenIrcs: number = newIrcs ? newIrcs.length : 0;
          totalIterations += newLenIrcs;

          break;
        } else {
          nIdxIl = ircs.length;
          break;
        }
      }
      if (nIdxIl > lenIrcs - 1) {
        t = stack.pop()!;
        if (stack.length === 0) {
          nbTxCmbn = t.getdOut().get(otGt)!.get(0)![1];
        } else {
          let pt = stack[stack.length - 1];
          this.onTaskCompleted(t, pt, dLinks);
        }
      }
    }

    return this.finalizeLinkMatrix(allAgg, itGt, otGt, dLinks, nbTxCmbn);
  }

  private finalizeLinkMatrix(
    allAgg: TxosAggregates,
    itGt: number,
    otGt: number,
    dLinks: Map<number, Map<number, number>>,
    nbTxCmbn: number,
  ): TxosAggregatorResult {
    // clone from this map for better performances
    const linksClear: number[][] = this.newLinkCmbn(allAgg);

    // Fills the matrix
    const links: number[][] = JSON.parse(JSON.stringify(linksClear)); // Deep copy
    this.updateLinkCmbn(links, itGt, otGt, allAgg);
    nbTxCmbn++;

    const linksX: number = links.length;
    const linksY: number = links[0].length;

    let i: number = 0;
    [...dLinks.entries()].forEach((firstKeyEntry: [number, Map<number, number>]) => {
      const key0: number = firstKeyEntry[0];

      // iterate dLinks key1
      [...firstKeyEntry[1].entries()].forEach((secondKeyEntry: [number, number]) => {
        const key1: number = secondKeyEntry[0];
        const mult: number = secondKeyEntry[1];

        const linkCmbn: number[][] = JSON.parse(JSON.stringify(linksClear)); // Deep copy
        this.updateLinkCmbn(linkCmbn, key0, key1, allAgg);

        for (let i = 0; i < linksX; i++) {
          for (let j = 0; j < linksY; j++) {
            links[i][j] = links[i][j] + linkCmbn[i][j] * mult;
          }
        }
      });

      i++;
    });

    // Return result
    return new TxosAggregatorResult(nbTxCmbn, links);
  }

  private onTaskCompleted(t: ComputeLinkMatrixTask, pt: ComputeLinkMatrixTask, dLinks: Map<number, Map<number, number>>): void {
    const il: number = t.getIl();
    const ir: number = t.getIr();

    [...t.getdOut().entries()].forEach((doutEntry: [number, Map<number, number[]>]) => {
      const or: number = doutEntry[0];
      const lOl: Map<number, number[]> = doutEntry[1];
      const rKey: [number, number] = [ir, or];

      [...lOl.entries()].forEach((olEntry: [number, number[]]) => {
        const ol: number = olEntry[0];
        const nbPrnt: number = olEntry[1][0];
        const nbChld: number = olEntry[1][1];

        const lKey: [number, number] = [il, ol];

        // Updates the dictionary of links for the pair of aggregates
        const nbOccur: number = nbChld + 1;
        this.addDLinkLine(rKey, nbPrnt, dLinks);
        this.addDLinkLine(lKey, nbPrnt * nbOccur, dLinks);

        // Updates parent d_out by back-propagating number of child combinations
        const pOr: number = ol + or;
        const plOl: Map<number, number[]> = pt.getdOut().get(pOr)!;
        Array.from(plOl.entries()).forEach((plOlEntry: [number, number[]]) => {
          plOlEntry[1][1] += nbOccur;
        });
      });
    });
  }

  private addDLinkLine(key: number[], addValue: number, dLinks: Map<number, Map<number, number>>): void {
    let subMap: Map<number, number> | undefined = dLinks.get(key[0]);
    if (!subMap) {
      subMap = new Map<number, number>();
      dLinks.set(key[0], subMap);
    }

    const currentValue: number = subMap.get(key[1]) || 0;
    subMap.set(key[1], currentValue + addValue);
  }

  private runTask(
    nIl: number,
    nIr: number,
    aggMatches: TxosAggregatesMatches,
    otGt: number,
    dOut: Map<number, Map<number, number[]>>,
  ): Map<number, Map<number, number[]>> {
    const ndOut: Map<number, Map<number, number[]>> = new Map<number, Map<number, number[]>>();

    // Iterates over outputs combinations previously found
    [...dOut.entries()].forEach((oREntry: [number, Map<number, number[]>]) => {
      const oR: number = oREntry[0];
      const sol: number = otGt - oR;
      // Computes the number of parent combinations
      let nbPrt = 0;
      [...oREntry[1].values()].forEach((value) => {
        nbPrt += value[0];
      });

      // Iterates over output sub-aggregates matching with left input sub-aggregate
      const valIl: number = aggMatches.getMatchInAggToVal().get(nIl)!;
      for (const nOl of aggMatches.getValToMatchOutAgg().get(valIl)!) {
        // Checks compatibility of output sub-aggregate with left part of output combination
        if ((sol & nOl) === 0) {
          // Computes:
          // the sum corresponding to the left part of the output combination
          // the complementary right output sub-aggregate
          const nSol: number = sol + nOl;
          const nOr: number = otGt - nSol;

          // Checks if the right output sub-aggregate is valid
          const valIr: number = aggMatches.getMatchInAggToVal().get(nIr)!;
          const matchOutAgg: number[] = aggMatches.getValToMatchOutAgg().get(valIr)!;

          // Adds this output combination into n_d_out if all conditions met
          if ((nSol & nOr) === 0 && matchOutAgg.includes(nOr)) {
            const ndOutVal: Map<number, number[]> = this.ndOutLine(ndOut, nOr);
            ndOutVal.set(nOl, [nbPrt, 0]);
          }
        }
      }
    });

    return ndOut;
  }

  private ndOutLine(ndOut: Map<number, Map<number, number[]>>, idx: number): Map<number, number[]> {
    let ndOutVal: Map<number, number[]> | undefined = ndOut.get(idx);
    if (!ndOutVal) {
      ndOutVal = new Map<number, number[]>();
      ndOut.set(idx, ndOutVal);
    }
    return ndOutVal;
  }

  /**
   * Creates a new linkability matrix.
   *
   * @param allAgg
   */
  private newLinkCmbn(allAgg: TxosAggregates): number[][] {
    let maxOutIndex: number = 0;
    for (const indexes of allAgg.getOutAgg().getAllAggIndexes()) {
      const max: number = Math.max(...indexes);
      if (max > maxOutIndex) {
        maxOutIndex = max;
      }
    }

    let maxInIndex: number = 0;
    for (const indexes of allAgg.getInAgg().getAllAggIndexes()) {
      const max: number = Math.max(...indexes);
      if (max > maxInIndex) {
        maxInIndex = max;
      }
    }

    // let matCmbn = ListsUtils.newIntMatrix(maxOutIndex + 1, maxInIndex + 1, 0);
    return Array.from({ length: maxOutIndex + 1 })
      .fill(null)
      .map(() => new Array(maxInIndex + 1).fill(0));
  }

  /**
   * Updates the linkability matrix for aggregate designated by inAgg/outAgg.
   *
   * @param matCmbn linkability matrix
   * @param inAgg input aggregate
   * @param outAgg output aggregate
   * @param allAgg
   */
  private updateLinkCmbn(matCmbn: number[][], inAgg: number, outAgg: number, allAgg: TxosAggregates): number[][] {
    const outIndexes: number[] = allAgg.getOutAgg().getAllAggIndexes()[outAgg];
    const inIndexes: number[] = allAgg.getInAgg().getAllAggIndexes()[inAgg];

    for (const inIndex of inIndexes) {
      for (const outIndex of outIndexes) {
        const value = matCmbn[outIndex][inIndex];
        matCmbn[outIndex][inIndex] = value + 1;
      }
    }

    return matCmbn;
  }

  /**
   * Builds a list of sets storing inputs having a deterministic link with an output
   *
   * @param matCmbn linkability matrix
   * @param nbCmbn number of combination
   * @return
   */
  public findDtrmLinks(matCmbn: number[][], nbCmbn: number): Set<number[]> {
    const dtrmCoords = new Set<number[]>();
    for (let i = 0; i < matCmbn.length; i++) {
      for (let j = 0; j < matCmbn[i].length; j++) {
        if (matCmbn[i][j] === nbCmbn) {
          dtrmCoords.add([i, j]);
        }
      }
    }

    return dtrmCoords;
  }
}
