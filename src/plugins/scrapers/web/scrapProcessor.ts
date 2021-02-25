import { ScrapedBeer } from "../../../core";
import { Page } from "puppeteer";

/**
 * Auxiliary interface to allow page processing and scraping.
 *
 * Each website, due to its unique structure,
 * will require a different approach during scraping, which
 * will be a responsibility of concrete implementations
 * of this interface.
 *
 * Should be used in conjunction with {@link WebScraper}
 */
export interface ScrapProcessor {
  /**
   * Dive into the Web Site trying to scrape data regarding a
   * beer
   * @param page A page instance, related to a headless browser
   * @param beerName term that will be scraped in the page context
   * @returns A Promise that will resolve into a list of found beers
   */
  run(page: Page, beerName: string): Promise<ScrapedBeer[]>;
}
