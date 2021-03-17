import { ScrapedBeer, Source } from "./scrapedBeer";

/**
 * Base Adapter to implement different Scrapers for different sources
 */
export interface SourceScraper {
  /**
   * Returns the the source in which the scraper will
   * getter and process data.
   * This is important to identify which source have done
   * its work and also to properly alert which one had a failure.
   * @returns A source instance related to this scraper
   */
  getSource(): Source;

  /**
   * Scrap Beers from a specific data source. It might return a list of
   * probable beers, that matches the requested beer by its name.
   *
   * @param beerName Name of the beer to be searched and scraped
   * @returns A Promise that will resolve into a list of possible {@link ScrapedBeer}
   */
  scrapeByName(beerName: string): Promise<ScrapedBeer[]>;
}
