import { Command } from "commander";
import { ScrapedBeer, Scraper } from "./core";
import { SamplerProcessor, WebScraper } from "./plugins/scrapers/web";
import chalk from "chalk";
import chalkTable from "chalk-table";
import * as figlet from "figlet";

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

  private initializeProgram() {
    const program = new Command();

    program.requiredOption(
      "-s, --search <beer>",
      "Beer you are interested in searching for prices"
    );
    program.option("f, --file", "Export the results to a csv file");

    program.parse(process.argv);

    return program;
  }
  run(): void {
    this.printLn(figlet.textSync("Cerva Jäger", { horizontalLayout: "full" }));

    const program = this.initializeProgram();
    const options = program.opts();

    this.printLn("");
    this.printLn(`Presenting results for: ${chalk.gray(options.search)}`);

    const scraper = new Scraper([new WebScraper(new SamplerProcessor())]);
    scraper
      .byName(options.search)
      .then((results) => results.map((result) => this.toPrintableRow(result)))
      .then((rows) => this.printTable(rows))
      .then(() => this.printLn(""))
      .catch((err) => {
        console.log(chalk.redBright(err));
      })
      .finally(() => {
        process.exit(0);
      });
  }

  private printLn(text: string): void {
    console.log(chalk.blueBright(text));
  }

  private printTable(rows: PrintableRow[]): void {
    return console.log(chalkTable(rows, App.TABLE_OPTIONS));
  }

  private toPrintableRow(beer: ScrapedBeer): PrintableRow {
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
