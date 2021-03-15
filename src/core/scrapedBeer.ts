/**
 * Interface description of a Scraped source.
 */
export interface Source {
  name: string;
  location?: string;
}

/**
 * DTO which will hold all gathered information of a scrapped Beer
 */
export class ScrapedBeer {
  name: string;
  price?: number;
  currency: string;
  found = true;
  available = true;
  source: Source;
}

/**
 * Utility DTO with default values setup for an undiscovered beer
 */
export class UndiscoveredBeer extends ScrapedBeer {
  constructor(beerName: string, source: Source) {
    super();
    this.name = beerName;
    this.found = false;
    this.available = false;
    this.currency = "";
    this.source = source;
  }
}
