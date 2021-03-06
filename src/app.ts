import { Command } from "commander";
import { ScrapedBeer, Scraper } from "./core";
import { SamplerProcessor, WebScraper } from "./plugins/scrapers/web";
import chalk from "chalk";
import chalkTable from "chalk-table";
import * as figlet from "figlet";
import { DamerauMatcher } from "./core/matcher";
import Logger from "./logger";

declare type PrintableRow = {
  name: string;
  price: string;
  availability: string;
};

//TODO Multi-language support
class Availability {
  private static readonly OPTIONS = {
    InStock: "in stock",
    OutOfStock: "out of stock",
    NotFound: "unavailable",
  };

  public static getFor(beer: ScrapedBeer): string {
    let availability = Availability.OPTIONS.InStock;
    if (!beer.found) {
      availability = Availability.OPTIONS.NotFound;
    } else if (!beer.available) {
      availability = Availability.OPTIONS.OutOfStock;
    }
    return availability;
  }
}

//TODO Deal with a puppeeter bug, where zombie browsers keep consuming resources
/**
 * CLI Application
 */
export default class App {
  private static TABLE_OPTIONS = {
    leftPad: 2,
    columns: [
      { field: "name", name: chalk.cyan("Beer Name") },
      { field: "price", name: chalk.cyan("Price [asc]") },
      { field: "availability", name: chalk.cyan("Availability") },
    ],
  };

  private log = Logger.getInstance();

  private initializeProgram() {
    const program = new Command();

    program.requiredOption(
      "-s, --search <beer>",
      "Beer you are interested in searching for prices"
    );
    program.option("d, --debug", "Enable debug mode");

    program.parse(process.argv);

    return program;
  }
  run(): void {
    this.log.info("Starting CervaJager CLI");
    this.printLn(figlet.textSync("Cerva Jäger", { horizontalLayout: "full" }));

    const program = this.initializeProgram();
    const options = program.opts();

    if (options.debug) {
      Logger.enableDebug();
      this.log.info("Debug mode enabled");
    }

    const sources = [new WebScraper(new SamplerProcessor())];
    this.log.debug("Loaded Sources: %O", sources);

    const matcher = new DamerauMatcher(80);
    this.log.debug("Term Matcher: %O", matcher);

    this.log.info("Starting price scraping for: %s", options.search);

    this.printLn("");
    this.printLn(`Presenting results for: ${chalk.gray(options.search)}`);

    const scraper = new Scraper(sources, matcher);
    scraper
      .byName(options.search)
      .then((results) => this.toPrintableTable(results))
      .then((table) => this.printTable(table))
      .then(() => this.printLn(""))
      .catch((err) => {
        this.log.error(err);
        console.log(chalk.redBright(err));
      })
      .finally(() => {
        this.log.info("CervaJager CLI Exited");
      });
  }

  private printLn(text: string): void {
    console.log(chalk.blueBright(text));
  }

  private printTable(rows: PrintableRow[]): void {
    return console.log(chalkTable(rows, App.TABLE_OPTIONS));
  }

  private toPrintableTable(results: ScrapedBeer[]) {
    this.log.info("Beers Found: %d", results.length);
    this.log.debug("%O", results);
    return results.map((result) => this.toPrintableRow(result));
  }

  private toPrintableRow(beer: ScrapedBeer): PrintableRow {
    this.log.info("%s: %d (%s)", beer.name, beer.price, beer.source.name);
    const name = chalk.cyan(beer.source.name);
    const price = beer.found
      ? `${chalk.cyan(beer.currency)} ${chalk.cyan(beer.price)}`
      : "-";

    const availability = Availability.getFor(beer);

    return { name, price, availability };
  }
}

const app = new App();
app.run();
