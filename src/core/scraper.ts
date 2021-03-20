import * as _ from "./utilities";
import { ScrapedBeer, Source } from "./scrapedBeer";
import { SourceScraper } from "./sourceScraper";

export declare type ScraperResult = {
  scrapedBeers: ReadonlyArray<ScrapedBeer>;
  errors: ReadonlyArray<ScrapeError>;
};

/**
 * Entity that represents any errors that might occur at one {@link SourceScraper}
 */
export class ScrapeError {
  readonly source: Source;
  readonly reason: string;

  constructor(reason: string, source: Source) {
    this.source = source;
    this.reason = reason;
  }

  public toString = (): string => {
    return `ScrapeError [ ${this.source.name} ] : ${this.reason}`;
  };
}

/**
 * Scraper module provides methods to search for prices of beers on different
 * data sources.
 */
export class Scraper {
  /**
   * Create a new instance of a scraper
   * @param sources list containing sources to be scraped
   * @throws If the list is empty or null
   */
  constructor(private sources: SourceScraper[]) {
    if (!sources || !sources.length) {
      throw Error("source list must contain at least one source");
    }
  }

  /**
   * Search all sources by the specified term. The search will occurs
   * in parallel, going through all {@var sources}.
   * The method will resolve all source and will not halt when one them fails.
   *
   * Results, with found beers and failed source will be detailed at the
   * result of the method.
   *
   * Found beers will start with all in-stock beers, ordered by price (ascending), and
   * will end with all unavailable/out-of-stock beers, ordered by name.
   *
   * @param searchTerm The name of the beer
   * @returns A promise that will resolve into a {@link ScraperResult}
   * @throws if given search term is null or empty
   */
  public async byName(searchTerm: string): Promise<ScraperResult> {
    if (_.isBlank(searchTerm)) {
      throw new Error("Beer Name must not be null nor empty");
    }

    return await Promise.allSettled(
      this.sources.map((s) => s.scrapeByName(searchTerm))
    ).then((results) => this.settleResults(results));
  }

  private settleResults(
    results: PromiseSettledResult<ScrapedBeer[]>[]
  ): ScraperResult {
    let scrapedBeers: ScrapedBeer[] = [];
    const errors: ScrapeError[] = [];

    for (let index = 0; index < results.length; index++) {
      const result = results[index];
      if (result.status === "fulfilled") {
        result.value.forEach(
          (beers) => (scrapedBeers = scrapedBeers.concat(beers))
        );
      } else {
        errors.push(
          new ScrapeError(result.reason, this.sources[index].getSource())
        );
      }
    }

    scrapedBeers = this.sortResult(
      scrapedBeers.map((beer) => {
        beer.name = _.capitalize(beer.name);
        return beer;
      })
    );

    return { scrapedBeers, errors };
  }

  private sortResult(beers: ScrapedBeer[]): ScrapedBeer[] {
    const nonPricedBeers = beers
      .filter((beers) => !beers.price)
      .sort((s1, s2) => 0 - (s1.name > s2.name ? -1 : 1));

    return beers
      .filter((beer) => beer.price)
      .sort((s1, s2) => 0 - (s1.price > s2.price ? -1 : 1))
      .concat(nonPricedBeers);
  }
}
