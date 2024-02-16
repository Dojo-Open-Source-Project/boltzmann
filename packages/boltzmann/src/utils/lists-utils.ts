import { type Logger, Utils } from "./utils.js";

function powerSet(set: number[], logger: Logger): number[][] {
	const max = 1 << set.length;
	const result: number[][] = [[]];
	const PROGRESS_ID = "powerSet";
	for (const value of set) {
		const previousSubsets = [...result];
		for (const [i, subset] of previousSubsets.entries()) {
			result.push(subset.concat(value));
			Utils.logProgress(logger, PROGRESS_ID, i, max);
		}
		Utils.logProgressDone(logger, PROGRESS_ID, max);
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
function mergeSets(sets: Set<string>[]): Set<string>[] {
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
				if (
					[...current].filter((value) => -1 !== [...x].indexOf(value))
						.length === 0
				) {
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

function newIntMatrix(
	lines: number,
	cols: number,
	fillValue: number,
): number[][] {
	const matCmbn: number[][] = Array.from<number[]>({ length: lines }).fill([]);
	for (let i = 0; i < lines; i++) {
		matCmbn[i] = newIntBigList(cols, fillValue);
	}
	return matCmbn;
}

function newIntBigList(size: number, fillValue: number): number[] {
	return Array.from<number>({ length: size }).fill(fillValue);
}

function fill<T>(bigList: T[], value: T, size: number): void {
	for (let i = 0; i < size; i++) {
		bigList.push(value);
	}
}

export const ListsUtils = {
	powerSet,
	mergeSets,
	newIntMatrix,
	newIntBigList,
	fill,
};
