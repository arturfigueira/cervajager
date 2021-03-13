import { ScrapedBeer, SourceScraper } from "../../../core";
import puppeteer, { Browser, Page } from "puppeteer";
import { ScrapProcessor } from "./scrapProcessor";

/**
 * Scraper concrete implementation that has the ability to access
 * remote web sites and scrape it. As the scraper might be dealing with
 * different web sites, with unique structures a {@link ScrapProcessor}
 * will take responsibility into evaluating the web page and
 * processing the data
 */
export class WebScraper implements SourceScraper {
  private static readonly VIEWPORT_BEST_SIZE = { width: 2048, height: 1024 };

  private static readonly FILTERS = ["image", "font"];

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
    const browser: Browser = await puppeteer.launch({
      args: [
        "--hide-scrollbars",
        "--mute-audio",
        "--disable-infobars",
        "--disable-breakpad",
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });
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
      this.setPageAndProcess(browser, processor, beerName)
    );
  }

  protected setPageAndProcess(
    browser: Browser,
    processor: ScrapProcessor,
    beerName: string
  ): Promise<ScrapedBeer[]> {
    return browser.newPage().then((page) => {
      page.setViewport(WebScraper.VIEWPORT_BEST_SIZE);
      return page
        .setRequestInterception(true)
        .then(() => this.runProcessor(page, processor, beerName));
    });
  }

  protected runProcessor(
    page: Page,
    processor: ScrapProcessor,
    beerName: string
  ): Promise<ScrapedBeer[]> {
    this.applyFiltersToPage(page);
    return processor.run(page, beerName);
  }

  protected applyFiltersToPage(page: Page): void {
    page.on("request", (req) => {
      if (WebScraper.FILTERS.some((type) => req.resourceType() === type)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  protected evaluateResults(
    results: PromiseSettledResult<ScrapedBeer[]>[]
  ): ScrapedBeer[] {
    let scrapedBeers: ScrapedBeer[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        result.value.forEach(
          (beers) => (scrapedBeers = scrapedBeers.concat(beers))
        );
      } else {
        console.error(`A Scrape process ended badly. ${result.reason}`);
      }
    });

    results;
    return scrapedBeers;
  }
}
