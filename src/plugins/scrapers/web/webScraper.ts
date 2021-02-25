import { ScrapedBeer, SourceScraper } from "../../../core";
import puppeteer, { Browser, Page } from "puppeteer";
import { ScrapProcessor } from "./scrapProcessor";

export declare type WebResource = { browser: Browser; page: Page };

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

  constructor(protected scrapProcessor: ScrapProcessor) {
    if (!scrapProcessor) {
      throw new Error("A Scrape Handler must be provided");
    }
  }

  /**
   * @inheritdoc
   */
  scrapeByName(beerName: string): Promise<ScrapedBeer[]> {
    return this.launch().then((resources) =>
      this.scrapProcessor
        .run(resources.page, beerName)
        .finally(() => resources.browser.close())
    );
  }

  protected async launch(): Promise<WebResource> {
    const browser: Browser = await puppeteer.launch();
    const page: Page = await browser.newPage();
    page.setViewport(WebScraper.VIEWPORT_BEST_SIZE);
    return { browser, page };
  }
}
