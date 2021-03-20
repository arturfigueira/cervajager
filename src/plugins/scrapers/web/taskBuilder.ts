import { Page } from "puppeteer";
import { ScrapedBeer } from "../../../core";
import { FailedTask, TaskResult } from "./taskResult";
import { Worker } from "./worker";

export declare type TaskArguments = {
  page: Page;
  data: string;
};

/**
 * Helper class to build tasks that will be injected into the
 * puppeteer cluster queued element
 */
export default class TaskBuilder {
  private static VIEWPORT_SIZE = { width: 2048, height: 1024 };

  private static FILTERS = ["image", "font"];

  //TODO Passing just the method build wont maintain the 'this' reference, return a function instead
  static buildFor(
    worker: Worker
  ): (args: TaskArguments) => Promise<TaskResult<string | ScrapedBeer[]>> {
    if (!worker) {
      throw new Error("Given worker is invalid");
    }

    return async (args: TaskArguments) => {
      args.page.setViewport(TaskBuilder.VIEWPORT_SIZE);

      await args.page.setRequestInterception(true);
      args.page.on("request", (req) => {
        if (TaskBuilder.FILTERS.some((type) => req.resourceType() === type)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      return await worker.processor
        .run(args.page, args.data)
        .then((beers) => {
          let filteredBeers = beers;
          if (worker.matcher) {
            filteredBeers = beers.filter((beer) =>
              worker.matcher.matches(beer.name, args.data)
            );
          }
          return filteredBeers;
        })
        .then((filteredBeers) => new TaskResult<ScrapedBeer[]>(filteredBeers))
        .catch((err) => new FailedTask(err.message));
    };
  }
}
