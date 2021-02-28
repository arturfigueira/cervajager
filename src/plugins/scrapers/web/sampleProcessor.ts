import { ScrapedBeer, UndiscoveredBeer } from "../../../core";
import { Page } from "puppeteer";
import { ScrapProcessor } from ".";
import * as JSON from "jsonfile";

/**
 * Just a simple processor implementation, as an example.
 * This processor wont access any web site.
 *
 * The data will be gathered from a sample json file, locally, which
 * contains a list of beers.
 *
 * The search by name is pretty rough and simple and can return mismatches.
 */
export class SamplerProcessor implements ScrapProcessor {
  private readonly file = "./samples/sample.json";
  private readonly source = { name: "Wonka", location: this.file };

  /**
   * @inheritdoc
   */
  async run(page: Page, beerName: string): Promise<ScrapedBeer[]> {
    return JSON.readFile(this.file).then((obj) => this.filter(obj, beerName));
  }

  private filter(nodes: any[], beerName: string): ScrapedBeer[] {
    const searchTerms = beerName.replace(/\d+ml/gi, "").trim().split(" ");

    let result = nodes
      .filter((node) => this.evaluateName(node.name, searchTerms))
      .map((node) => this.parse(node));

    if (!result.length) {
      result = [new UndiscoveredBeer(beerName, this.source)];
    }

    return result;
  }

  private evaluateName(nodeName: string, searchTerms: string[]): boolean {
    let score = 0;
    searchTerms.forEach((term) => (score += nodeName.indexOf(term)));

    return score > 0;
  }

  private parse(node: any): ScrapedBeer {
    return {
      name: node.name,
      price: node.price,
      currency: node.currency,
      found: true,
      available: node.inStock,
      source: this.source,
    };
  }
}
