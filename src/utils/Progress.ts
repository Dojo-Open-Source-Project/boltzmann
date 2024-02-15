import { Utils } from "./Utils.js";

export class Progress {
  private readonly name: string;
  private readonly start: number;
  private last: number;
  private current: number;
  private target: number;
  private rate: number;
  private msg: string;

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

  public getName(): string {
    return this.name;
  }

  public getTarget(): number {
    return this.target;
  }

  public getLast(): number {
    return this.last;
  }

  public getRate(): number {
    return this.rate;
  }

  public getMsg(): string {
    return this.msg;
  }
}
