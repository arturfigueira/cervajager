import { ScrapedBeer, SourceScraper } from "../../../core";
import puppeteer, { Browser } from "puppeteer";
import { ScrapProcessor } from "./scrapProcessor";

/**
 * Scraper concrete implementation that has the ability to access
 * remote web sites and scrape it. As the scraper might be dealing with
 * different web sites, with unique structures a {@link ScrapProcessor}
 * will take responsibility into evaluating the web page and
 * processing the data
 */
export class WebScraper implements SourceScraper {
  //TODO move it to an external config
  //TODO Add Log
  private static readonly VIEWPORT_BEST_SIZE = { width: 2048, height: 1024 };

  /**
   * Create a new WebScraper with a list of Processors
   * @param scrapProcessors Non-null, nor empty list of web processors
   * @throws If the scrapProcessor is null or empty
   */
  constructor(protected scrapProcessors: ScrapProcessor[]) {
    if (!scrapProcessors || scrapProcessors.length == 0) {
      throw new Error("At least one Scrape Handler must be provided");
    }
  }

  protected async launch(): Promise<Browser> {
    const browser: Browser = await puppeteer.launch();
    return browser;
  }

  /**
   * @inheritdoc
   */
  scrapeByName(beerName: string): Promise<ScrapedBeer[]> {
    return this.launch().then((browser) => {
      return Promise.allSettled(this.launchScrapers(browser, beerName))
        .then((result) => this.evaluateResults(result))
        .finally(() => browser.close());
    });
  }

  protected launchScrapers(
    browser: Browser,
    beerName: string
  ): Promise<ScrapedBeer[]>[] {
    return this.scrapProcessors.map((processor) =>
      this.processPage(browser, processor, beerName)
    );
  }

  protected processPage(
    browser: Browser,
    processor: ScrapProcessor,
    beerName: string
  ): Promise<ScrapedBeer[]> {
    return browser.newPage().then((page) => {
      page.setViewport(WebScraper.VIEWPORT_BEST_SIZE);
      return processor.run(page, beerName);
    });
  }

  protected evaluateResults(
    results: PromiseSettledResult<ScrapedBeer[]>[]
  ): ScrapedBeer[] {
    //TODO how to warn failed promises? Log?

    let scrapedBeers: ScrapedBeer[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        result.value.forEach(
          (beers) => (scrapedBeers = scrapedBeers.concat(beers))
        );
      }
    });

    results;
    return scrapedBeers;
  }
}
