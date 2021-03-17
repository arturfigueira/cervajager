import chalk from "chalk";
import chalkTable from "chalk-table";
import { ScrapedBeer, ScraperResult, ScrapeError } from "../core";
import Logger from "./logger";

declare type PrintableRow = {
  name: string;
  price: string;
  store: string;
  availability: string;
};

enum Options {
  InStock = "in stock",
  OutOfStock = "out of stock",
  NotFound = "unavailable",
}
class Availability {
  public static getFor(beer: ScrapedBeer): string {
    let availability = Options.InStock;
    if (!beer.found) {
      availability = Options.NotFound;
    } else if (!beer.available) {
      availability = Options.OutOfStock;
    }
    return availability;
  }
}

export default class ResultPrinter {
  public static print(results: ScraperResult): void {
    BeersPrinter.print(results.scrapedBeers);
    ErrorPrinter.print(results.errors);
  }
}

class BeersPrinter {
  private static LOG = Logger.getInstance();

  private static TABLE_OPTIONS = {
    leftPad: 2,
    columns: [
      { field: "name", name: chalk.cyan("Beer Name") },
      { field: "price", name: chalk.cyan("Price [asc]") },
      { field: "store", name: chalk.cyan("Store") },
      { field: "availability", name: chalk.cyan("Availability") },
    ],
  };

  public static print(results: readonly ScrapedBeer[]): void {
    const rows = BeersPrinter.toPrintableTable(results);
    BeersPrinter.printTable(rows);
  }

  private static toPrintableTable(
    results: readonly ScrapedBeer[]
  ): PrintableRow[] {
    BeersPrinter.LOG.info("Beers Found: %d", results.length);
    BeersPrinter.LOG.debug("%O", results);
    return results.map((result) => BeersPrinter.toPrintableRow(result));
  }

  private static toPrintableRow(beer: ScrapedBeer): PrintableRow {
    BeersPrinter.LOG.info(
      "%s: %d (%s)",
      beer.name,
      beer.price,
      beer.source.name
    );
    const name = chalk.cyan(beer.name);
    const store = chalk.cyan(beer.source.name);
    const price =
      beer.found && beer.price
        ? `${chalk.cyan(beer.currency)} ${chalk.cyan(beer.price)}`
        : "-";

    const availability = Availability.getFor(beer);

    return { name, price, store, availability };
  }

  private static printTable(rows: PrintableRow[]): void {
    return console.log(chalkTable(rows, BeersPrinter.TABLE_OPTIONS));
  }
}

class ErrorPrinter {
  private static LOG = Logger.getInstance();

  public static print(errors: readonly ScrapeError[]): void {
    if (errors.length) {
      console.log(
        chalk.redBright("\n\tUnfortunately some stores could not be consulted:")
      );

      errors.forEach((error) => {
        console.log(chalk.gray(`\t- ${error.source.name}`));
      });

      ErrorPrinter.LOG.error(
        `Some scrapers ended badly:\n${errors.join("\n")}`
      );
    }
  }
}
