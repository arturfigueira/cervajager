import * as _ from "./utilities";
import { ScrapedBeer } from "./scrapedBeer";
import { SourceScraper } from "./sourceScraper";
import { NameMatcher } from "./matcher/nameMatcher";

//TODO Add Currency Conversion
export class Scraper {
  constructor(private sources: SourceScraper[], private matcher: NameMatcher) {
    if (!sources.length) {
      throw Error("source list must contain at least one source");
    }
    if (!matcher) {
      throw Error("A NameMatcher instance should be provided");
    }
  }

  public async byName(searchTerm: string): Promise<ScrapedBeer[]> {
    if (_.isBlank(searchTerm)) {
      throw new Error("Beer Name must not be null nor empty");
    }

    let scrapedBeers: ScrapedBeer[] = [];
    await Promise.all(this.sources.map((s) => s.scrapeByName(searchTerm))).then(
      (results) => {
        results.forEach(
          (result) => (scrapedBeers = scrapedBeers.concat(result))
        );
      }
    );

    return scrapedBeers
      .filter((beer) => this.matcher.matches(beer.name, searchTerm))
      .sort((s1, s2) => 0 - (s1.price > s2.price ? -1 : 1));
  }
}
