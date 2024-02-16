export interface LinkerOptions {
	precheck?: boolean;
	linkability?: boolean;
	mergeInputs?: boolean;
	mergeOutputs?: boolean;
	mergeFees?: boolean;
}

export enum LogLevel {
	NONE = 0,
	INFO = 1,
	DEBUG = 2,
}

export interface BoltzmannOptions {
	logLevel?: keyof typeof LogLevel;
	maxDuration?: number;
	maxTxos?: number;
	maxCjIntrafeesRatio?: number;
	linkerOptions?: LinkerOptions;
}

export interface BoltzmannSettings
	extends Required<Omit<BoltzmannOptions, "logLevel">> {
	logLevel: LogLevel;
}

export const MAX_DURATION_DEFAULT = 600;
export const MAX_TXOS_DEFAULT = 12;
export const MAX_CJ_INTRAFEES_DEFAULT = 0;
export const LINKER_OPTIONS_DEFAULT = {
	precheck: true,
	linkability: true,
	mergeInputs: true,
} satisfies LinkerOptions;

export const createBoltzmannSettings = (
	options?: BoltzmannOptions,
): BoltzmannSettings => {
	return {
		logLevel: options?.logLevel ? LogLevel[options.logLevel] : LogLevel.NONE,
		maxDuration: options?.maxDuration ?? MAX_DURATION_DEFAULT,
		maxTxos: options?.maxTxos ?? MAX_TXOS_DEFAULT,
		maxCjIntrafeesRatio:
			options?.maxCjIntrafeesRatio ?? MAX_CJ_INTRAFEES_DEFAULT,
		linkerOptions: options?.linkerOptions ?? LINKER_OPTIONS_DEFAULT,
	};
};
