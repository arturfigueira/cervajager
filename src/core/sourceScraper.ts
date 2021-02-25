import { ScrapedBeer } from "./scrapedBeer";

/**
 * Base Adapter to implement different Scrapers for different sources
 */
export interface SourceScraper {
  /**
   * Scrap Beers from a specific data source. It might return a list of
   * probable beers, that matches the requested beer by its name.
   *
   * @param beerName Name of the beer to be searched and scraped
   * @returns A Promise that will resolve into a list of possible {@link ScrapedBeer}
   */
  scrapeByName(beerName: string): Promise<ScrapedBeer[]>;
}
