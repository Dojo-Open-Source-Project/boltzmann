export class ListsUtils {
  public static powerSet(set: number[]): number[][] {
    const result: number[][] = [[]];
    for (const value of set) {
      const previousSubsets = [...result];
      for (const subset of previousSubsets) {
        result.push(subset.concat(value));
      }
    }
    return result;
  }

  /**
   * Checks if sets from a list of sets share common elements and merge sets when common elements
   * are detected
   *
   * @param sets list of sets
   * @return Returns the list with merged sets.
   */
  public static mergeSets(sets: Set<string>[]): Set<string>[] {
    let tmpSets = [...sets];
    let merged = true;
    while (merged) {
      merged = false;
      const res: Set<string>[] = [];
      while (tmpSets.length > 0) {
        let current = tmpSets.shift() as Set<string>;
        const rest = tmpSets;
        tmpSets = [];
        for (const x of rest) {
          if ([...current].filter((value) => -1 !== [...x].indexOf(value)).length === 0) {
            tmpSets.push(x);
          } else {
            merged = true;
            current = new Set([...current, ...x]);
          }
        }
        res.push(current);
      }
      tmpSets = res;
    }
    return tmpSets;
  }

  public static newIntMatrix(lines: number, cols: number, fillValue: number): number[][] {
    const matCmbn: number[][] = Array.from<number[]>({ length: lines }).fill([]);
    for (let i = 0; i < lines; i++) {
      matCmbn[i] = ListsUtils.newIntBigList(cols, fillValue);
    }
    return matCmbn;
  }

  public static newIntBigList(size: number, fillValue: number): number[] {
    return Array.from<number>({ length: size }).fill(fillValue);
  }

  public static clone(copy: number[][]): number[][] {
    const c: number[][] = Array.from<number[]>({ length: copy.length }).fill([]);
    for (const [i, line] of copy.entries()) {
      const copyLine = [...line]; // cloning line
      c[i] = copyLine;
    }
    return c;
  }

  public static fill<T>(bigList: T[], value: T, size: number): void {
    for (let i = 0; i < size; i++) {
      bigList.push(value);
    }
  }
}
