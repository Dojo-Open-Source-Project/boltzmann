import v8 from "v8";
import { Progress } from "./Progress.js";

export class Utils {
  private static BYTE_TO_MB: number = 1024 * 1024;
  private static LOG_PROGRESS_FREQUENCY: number = 30; // log progress every 30s

  private static progressLast: Map<string, Progress> = new Map<string, Progress>();
  private static progressResult: Array<Progress> = [];

  private static maxMemUsed: number = 0;

  public static logMemory(msg: string) {
    const totalHeapSize: number = v8.getHeapStatistics().total_available_size / this.BYTE_TO_MB;
    const usedHeapSize: number = v8.getHeapStatistics().used_heap_size / this.BYTE_TO_MB;
    console.log(`${totalHeapSize - usedHeapSize}M free - ${msg ?? ""}`);

    // update maxMemUsed
    if (usedHeapSize > this.maxMemUsed) {
      this.maxMemUsed = usedHeapSize;
    }
  }

  public static logProgress(progressId: string, current: number, target: number, msg: string = "") {
    let progress = this.progressLast.get(progressId);
    const now = Date.now();
    if (progress && now - progress.getLast() < this.LOG_PROGRESS_FREQUENCY * 1000) {
      // don't log, too early
      return;
    }

    // update last
    if (progress) {
      progress.update(current, target);
    } else {
      progress = new Progress(progressId, current, target);
      this.progressLast.set(progressId, progress);
    }

    // log
    this.logMemory(`${progress.getProgress()} ${msg}`);
  }

  public static logProgressDone(progressId: string, target: number, msg: string = "") {
    const progress = this.progressLast.get(progressId);
    if (progress) {
      this.progressResult.push(progress);
      this.progressLast.delete(progressId);
    }
    const str = progress ? progress.done(target, msg) : `[${progressId}] (no iteration) ${msg}`;
    this.logMemory(str);
  }

  public static getProgressResult(): Array<Progress> {
    return this.progressResult;
  }

  public static getMaxMemUsed(): number {
    return this.maxMemUsed;
  }

  public static duration(seconds: number): string {
    let minutes: number = 0;
    let hours: number = 0;
    let days: number = 0;
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
    let sb: string = "";
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
