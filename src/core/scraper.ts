import * as _ from "./utilities";
import { ScrapedBeer } from "./scrapedBeer";
import { SourceScraper } from "./sourceScraper";
import { NameMatcher } from "./nameMatcher";

//TODO Add Currency Conversion
export class Scraper {
  constructor(private sources: SourceScraper[]) {
    if (!sources.length) {
      throw Error("source list must contain at least one source");
    }
  }

  public async byName(beerName: string): Promise<ScrapedBeer[]> {
    if (_.isBlank(beerName)) {
      throw new Error("Beer Name must not be null nor empty");
    }

    let scrapedBeers: ScrapedBeer[] = [];
    await Promise.all(this.sources.map((s) => s.scrapeByName(beerName))).then(
      (results) => {
        results.forEach(
          (result) => (scrapedBeers = scrapedBeers.concat(result))
        );
      }
    );

    const matcher = new NameMatcher(beerName);
    return scrapedBeers
      .filter((beer) => matcher.matches(beer.name))
      .sort((s1, s2) => 0 - (s1.price > s2.price ? -1 : 1));
  }
}
