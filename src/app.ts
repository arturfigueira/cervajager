import { Command } from "commander";
import { ScrapedBeer, Scraper } from "./core";
import { SamplerProcessor, WebScraper } from "./plugins/scrapers/web";

//TODO Deal with a puppeeter bug, where zombie browsers keep consuming resources
export default class App {
  run(): void {
    const program = new Command();
    program.requiredOption(
      "-s, --search <beer>",
      "Beer you are interested in searching for prices"
    );
    program.option("f, --file", "Export the results to a csv file");

    program.parse(process.argv);

    const options = program.opts();
    console.log(`App will search prices for: ${options.search}`);

    const scraper = new Scraper([new WebScraper(new SamplerProcessor())]);

    try {
      scraper
        .byName(options.search)
        .then((results) => results.map((result) => this.sout(result)));
    } catch (err) {
      console.log(err);
    }
  }

  private sout(beer: ScrapedBeer): void {
    let parsed = `- ${beer.source.name}: Not Found`;
    if (beer.found) {
      parsed = `- ${beer.source.name}: ${beer.price}`;

      if (!beer.available) {
        parsed += "(out of stock)";
      }
    }

    console.log(parsed);
  }
}

new App().run();
