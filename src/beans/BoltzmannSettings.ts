import { TxosLinkerOptionEnum } from "../linker/TxosLinkerOptionEnum.js";

export class BoltzmannSettings {
  static readonly MAX_DURATION_DEFAULT: number = 600;
  static readonly MAX_TXOS_DEFAULT: number = 12;
  static readonly MAX_CJ_INTRAFEES_DEFAULT: number = 0;
  static readonly OPTIONS_DEFAULT: TxosLinkerOptionEnum[] = [
    TxosLinkerOptionEnum.PRECHECK,
    TxosLinkerOptionEnum.LINKABILITY,
    TxosLinkerOptionEnum.MERGE_INPUTS,
  ];

  protected maxDuration: number;
  protected maxTxos: number;
  private maxCjIntrafeesRatio: number;
  private options: TxosLinkerOptionEnum[];

  constructor() {
    this.maxDuration = BoltzmannSettings.MAX_DURATION_DEFAULT;
    this.maxTxos = BoltzmannSettings.MAX_TXOS_DEFAULT;
    this.maxCjIntrafeesRatio = BoltzmannSettings.MAX_CJ_INTRAFEES_DEFAULT;
    this.options = BoltzmannSettings.OPTIONS_DEFAULT;
  }

  getMaxDuration(): number {
    return this.maxDuration;
  }

  setMaxDuration(maxDuration: number): void {
    this.maxDuration = maxDuration;
  }

  getMaxTxos(): number {
    return this.maxTxos;
  }

  setMaxTxos(maxTxos: number): void {
    this.maxTxos = maxTxos;
  }

  getMaxCjIntrafeesRatio(): number {
    return this.maxCjIntrafeesRatio;
  }

  setMaxCjIntrafeesRatio(maxCjIntrafeesRatio: number): void {
    this.maxCjIntrafeesRatio = maxCjIntrafeesRatio;
  }

  getOptions(): TxosLinkerOptionEnum[] {
    return this.options;
  }

  setOptions(options: TxosLinkerOptionEnum[]): void {
    this.options = options;
  }
}
