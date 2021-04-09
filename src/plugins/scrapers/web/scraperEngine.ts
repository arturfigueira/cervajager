import { Worker } from "./worker";
import { Cluster } from "puppeteer-cluster";
import { ScrapedBeer } from "../../../core";
import TaskBuilder from "./taskBuilder";
import { TaskResult } from "./taskResult";
import { LaunchOptions } from "puppeteer";

/**
 * Singleton engine responsible to start async scraper workers
 */
export class ScraperEngine {
  private static _INSTANCE: Promise<ScraperEngine> = null;
  private static CONCURRENT_WORKERS = 5;
  private static DEFAULT_TIMEOUT = 30000;

  private static LAUNCH_ARGS: LaunchOptions = {
    headless: true,
    args: [
      "--hide-scrollbars",
      "--mute-audio",
      "--disable-infobars",
      "--disable-breakpad",
    ],
  };

  private cluster: Cluster<string, TaskResult<string | ScrapedBeer[]>> = null;

  /**
   * Update the default Engine launch options.
   * Default is a headless browser with:
   *  --hide-scrollbars
   *  --mute-audio
   *  --disable-infobars
   *  --disable-breakpad
   *
   * Modifications will only take place when the engine is recreated
   *
   * @param opts a puppeteer {@link LaunchOptions} dictionary
   * @throws If opts is empty or null
   */
  public static setLaunchOptions(opts: LaunchOptions): void {
    if (!opts) {
      throw new Error("A valid launch option should be provided");
    }
    ScraperEngine.LAUNCH_ARGS = opts;
  }

  /**
   * Set the maximum workers allowed to execute simultaneously.
   * Default is 5.
   * Modifications will only take place when the engine is recreated
   * @param workers positive number of maximum concurrent workers
   * @throws If the number is not greater than zero
   */
  public static maxConcurrentWorks(workers: number): void {
    if (workers < 1) {
      throw new Error("Number of concurrent workers should be greater than 0");
    }
    ScraperEngine.CONCURRENT_WORKERS = workers;
  }

  /**
   * Set the queued tasks timeout. When the timeout is hit, an error will be thrown
   * Default is 30seconds.
   * Modifications will only take place when the engine is recreated
   * @param workers positive number of maximum concurrent workers
   * @throws If the number is not below zero
   */
  public static setDefaultTimeout(timeout: number): void {
    if (timeout < 0) {
      throw new Error("Timeout must be greater than zero");
    }
    ScraperEngine.DEFAULT_TIMEOUT = timeout;
  }

  /**
   * Get a instance of the Engine
   * @returns a promise that will resolve into an instance of {@link ScraperEngine}
   */
  public static async getInstance(): Promise<ScraperEngine> {
    if (!ScraperEngine._INSTANCE) {
      ScraperEngine._INSTANCE = new ScraperEngine().ready();
    }
    return ScraperEngine._INSTANCE;
  }

  private async ready(): Promise<ScraperEngine> {
    this.cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT,
      maxConcurrency: ScraperEngine.CONCURRENT_WORKERS,
      puppeteerOptions: ScraperEngine.LAUNCH_ARGS,
      timeout: ScraperEngine.DEFAULT_TIMEOUT,
    });
    return this;
  }

  /**
   * Halt the Engine and all its instances
   * @throws If no instance is being in use
   */
  public static async halt(): Promise<void> {
    if (!ScraperEngine._INSTANCE) {
      throw new Error("Illegal Engine State");
    }
    const instance = ScraperEngine._INSTANCE;
    ScraperEngine._INSTANCE = null;
    return instance.then((e) => {
      e.cluster.idle();
      e.cluster.close();
    });
  }

  /**
   * Queue a Scraper Worker to be processed by the engine
   * @param worker the worker that will be enqueued
   * @param retries optional number of retries before letting the queued work reject. Zero means no retries
   * @returns A promise that will resolve into a {@link TaskResult}, which can be a fulfilled or failed task
   */
  public static async queue(
    worker: Worker,
    retries: number = 0
  ): Promise<TaskResult<string | ScrapedBeer[]>> {
    return ScraperEngine.getInstance().then((engine) =>
      engine.execute(worker, retries)
    );
  }

  private async execute(
    worker: Worker,
    retries: number
  ): Promise<TaskResult<string | ScrapedBeer[]>> {
    retries--;
    if (!this.cluster) {
      throw new Error("Illegal Engine State");
    }

    return this.cluster
      .execute(worker.beerName, TaskBuilder.buildFor(worker))
      .catch((err) => {
        if (retries > 0) {
          return ScraperEngine.queue(worker, retries);
        }
        throw err;
      });
  }
}
