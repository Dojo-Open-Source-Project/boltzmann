import { PackType } from "./PackType.js";

type IEntry = [string, number];

export class Pack {
  private readonly lbl: string;
  private readonly packType: PackType;
  private readonly ins: IEntry[];
  private readonly outs: string[];

  constructor(lbl: string, packType: PackType, ins: IEntry[], outs: string[]) {
    this.lbl = lbl;
    this.packType = packType;
    this.ins = ins;
    this.outs = outs;
  }

  public getLbl(): string {
    return this.lbl;
  }

  public getPackType(): PackType {
    return this.packType;
  }

  public getIns(): IEntry[] {
    return this.ins;
  }

  public getOuts(): string[] {
    return this.outs;
  }
}
