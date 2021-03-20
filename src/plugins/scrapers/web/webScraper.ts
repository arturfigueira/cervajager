import { ScrapedBeer, SourceScraper, Source } from "../../../core";
import { ScrapProcessor } from "./scrapProcessor";
import { NameMatcher } from "../../../core/matcher";
import { ScraperEngine } from "./";
import { TaskStatus, TaskResult } from "./taskResult";

/**
 * Concrete Scraper implementation that has the ability to access
 * remote web sites and scrape it. As the scraper might be dealing with
 * different web sites, with unique structures a {@link ScrapProcessor}
 * will take responsibility into evaluating the web page and
 * processing the data. Also, web store usually add a bunch of other beers
 * to their results, making necessary to filter them. This will be done
 * by a {@link NameMatcher}.
 */
export class WebScraper implements SourceScraper {
  /**
   * Create a new Web Based scraper
   * @param scrapProcessors Non-null web processors
   * @param matcher Optional name matcher to remove undesired results. If ignored no filter will be applied over the results
   * @throws If the scrapProcessor is null or empty
   */
  constructor(
    protected scrapProcessor: ScrapProcessor,
    protected matcher?: NameMatcher
  ) {
    if (!scrapProcessor) {
      throw new Error("A Scrape Processor must be provided");
    }
  }

  /**
   * @inheritdoc
   */
  getSource(): Source {
    return this.scrapProcessor.getSource();
  }

  /**
   * @inheritdoc
   */
  scrapeByName(beerName: string): Promise<ScrapedBeer[]> {
    const worker = {
      beerName,
      processor: this.scrapProcessor,
      matcher: this.matcher,
    };

    return ScraperEngine.queue(worker).then((result) =>
      this.handleResult(result)
    );
  }

  private handleResult(result: TaskResult<string | ScrapedBeer[]>) {
    if (result.status === TaskStatus.Success) {
      return result.data as ScrapedBeer[];
    }
    throw new Error(result.data as string);
  }
}
