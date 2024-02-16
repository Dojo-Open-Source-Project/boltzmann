import { LogLevel } from "../beans/boltzmann-settings.js";

function isNodeJS(): boolean {
	return (
		typeof process !== "undefined" &&
		process.versions != null &&
		process.versions.node != null &&
		typeof window === "undefined"
	);
}

const v8 = isNodeJS() ? await import("node:v8") : null;

export const Logger = (logLevel: LogLevel) => {
	return {
		logLevel,
		logInfo: (...msg: string[]) => {
			logLevel >= LogLevel.INFO && console.log(...msg);
		},
		logDebug: (...msg: string[]) => {
			logLevel >= LogLevel.DEBUG && console.log(...msg);
		},
	};
};

export type Logger = ReturnType<typeof Logger>;

export class Utils {
	private static BYTE_TO_MB: number = 1024 * 1024;
	private static LOG_PROGRESS_FREQUENCY = 30; // log progress every 30s

	private static progressLast: Map<string, Progress> = new Map<
		string,
		Progress
	>();
	private static progressResult: Array<Progress> = [];

	private static maxMemUsed = 0;

	public static logMemory(logger: Logger, msg: string) {
		if (v8) {
			const totalHeapSize: number =
				v8.getHeapStatistics().total_available_size / Utils.BYTE_TO_MB;
			const usedHeapSize: number =
				v8.getHeapStatistics().used_heap_size / Utils.BYTE_TO_MB;
			logger.logInfo(`${totalHeapSize - usedHeapSize}M free - ${msg ?? ""}`);

			// update maxMemUsed
			if (usedHeapSize > Utils.maxMemUsed) {
				Utils.maxMemUsed = usedHeapSize;
			}
		} else {
			logger.logInfo(msg);
		}
	}

	public static logProgress(
		logger: Logger,
		progressId: string,
		current: number,
		target: number,
		msg = "",
	) {
		let progress = Utils.progressLast.get(progressId);
		const now = Date.now();
		if (progress && now - progress.last < Utils.LOG_PROGRESS_FREQUENCY * 1000) {
			// don't log, too early
			return;
		}

		// update last
		if (progress) {
			progress.update(current, target);
		} else {
			progress = new Progress(progressId, current, target);
			Utils.progressLast.set(progressId, progress);
		}

		// log
		Utils.logMemory(logger, `${progress.getProgress()} ${msg}`);
	}

	public static logProgressDone(
		logger: Logger,
		progressId: string,
		target: number,
		msg = "",
	) {
		const progress = Utils.progressLast.get(progressId);
		if (progress) {
			Utils.progressResult.push(progress);
			Utils.progressLast.delete(progressId);
		}
		const str = progress
			? progress.done(target, msg)
			: `[${progressId}] (no iteration) ${msg}`;
		Utils.logMemory(logger, str);
	}

	public static getProgressResult(): Array<Progress> {
		return Utils.progressResult;
	}

	public static getMaxMemUsed(): number {
		return Utils.maxMemUsed;
	}

	public static duration(seconds: number): string {
		let minutes = 0;
		let hours = 0;
		let days = 0;
		if (seconds >= 60) {
			minutes = Math.floor(seconds / 60);
			seconds %= 60;

			if (minutes >= 60) {
				hours = Math.floor(minutes / 60);
				minutes %= 60;
			}

			if (hours >= 24) {
				days = Math.floor(hours / 24);
				hours %= 24;
			}
		}
		let sb = "";
		if (days > 0) {
			sb += `${days}d`;
		}
		if (hours > 0) {
			sb += `${hours}h`;
		}
		if (minutes > 0) {
			sb += `${minutes}m`;
		}
		if (seconds > 0 || sb.length === 0) {
			sb += `${seconds}s`;
		}
		return sb;
	}
}

class Progress {
	readonly name: string;
	private readonly start: number;
	private current: number;
	last: number;
	target: number;
	rate: number;
	msg: string;

	public constructor(name: string, current: number, target: number) {
		this.name = name;
		this.start = Date.now();
		this.last = this.start;
		this.current = current === 0 ? 1 : current;
		this.target = target === 0 ? 1 : target;
		this.rate = 0;
		this.msg = "";
	}

	public computeElapsed(): number {
		return this.last - this.start;
	}

	public getProgress(): string {
		const elapsed = this.computeElapsed();
		const todo = this.target - this.current + 1;
		const donePercent = Math.floor((this.current * 100) / this.target);
		let str = `[${this.name}] ${donePercent}% ${this.current}/${this.target}`;

		if (elapsed > 0 || this.rate > 0) {
			const eta = this.rate > 0 ? Math.floor(todo / this.rate) : 0;
			str += ` since ${Utils.duration(elapsed / 1000)}, ${this.rate.toFixed(3)}/s, ETA ${Utils.duration(eta)}...`;
		}

		return str;
	}

	public getResult(): string {
		const elapsed = this.computeElapsed();
		return `[${this.name}] ${this.target}x in ${Utils.duration(elapsed)}s (${this.rate.toFixed(3)}/s) ${this.msg}`;
	}

	public update(current: number, target: number): void {
		const now = Date.now();
		const newRate = current / ((now - this.start) / 1000);
		this.rate = this.rate === 0 ? newRate : (this.rate + newRate) / 2;
		this.current = current;
		this.last = now;
		this.target = target;
	}

	public done(target: number, msg: string): string {
		this.last = Date.now();
		this.current = target;
		this.target = target;
		this.msg = msg;

		if (this.rate === 0) {
			this.rate = target;
		}

		const elapsed = this.computeElapsed();
		return `[${this.name}] 100% ${target} done in ${elapsed / 1000}s ${msg}`;
	}
}

export class CustomMap<K, V> implements Map<K, V> {
	private state: [K, V][];

	constructor(entries?: [K, V][] | null) {
		this.state = entries ? [...entries] : [];
	}

	[Symbol.iterator](): IterableIterator<[K, V]> {
		return this.state[Symbol.iterator]();
	}

	[Symbol.toStringTag] = "CustomMap";

	entries(): IterableIterator<[K, V]> {
		return this.state[Symbol.iterator]();
	}

	keys(): IterableIterator<K> {
		return this.state.map(([k, _]) => k)[Symbol.iterator]();
	}

	values(): IterableIterator<V> {
		return this.state.map(([_, v]) => v)[Symbol.iterator]();
	}

	clear() {
		this.state = [];
	}

	delete(key: K): boolean {
		const index = this.state.findIndex(([k, _]) => k === key);
		if (index !== -1) {
			this.state.splice(index, 1);
			return true;
		}
		return false;
	}

	forEach(
		callbackfn: (value: V, key: K, map: CustomMap<K, V>) => void,
		// biome-ignore lint/suspicious/noExplicitAny:
		thisArg?: any,
	): void {
		// biome-ignore lint/complexity/noForEach:
		this.state.forEach(([k, v]) => callbackfn.call(thisArg, v, k, this));
	}

	get(key: K): V | undefined {
		const entry = this.state.find(([k, _]) => k === key);
		return entry ? entry[1] : undefined;
	}

	has(key: K): boolean {
		return this.state.some(([k, _]) => k === key);
	}

	set(key: K, value: V): this {
		this.state.push([key, value]);
		return this;
	}

	get size() {
		return this.state.length;
	}
}
