import { Command } from "commander";
import chalk from "chalk";
import * as figlet from "figlet";
import ora from "ora";
import { DamerauMatcher } from "../core/matcher";
import Logger from "./logger";
import ResultPrinter from "./resultPrinter";
import { Scraper } from "../core";
import {
  SamplerProcessor,
  WebScraper,
  ScraperEngine,
} from "../plugins/scrapers/web";

/**
 * CLI Companion Application
 */
export default class App {
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
    Logger.interceptConsole();

    const timeStart = Date.now();

    this.log.info("Starting CervaJager CLI");
    this.printLn(figlet.textSync("CervaJäger", { horizontalLayout: "full" }));

    const program = this.initializeProgram();
    const options = program.opts();

    if (options.debug) {
      Logger.enableDebug();
      this.log.info("Debug mode enabled");
    }

    try {
      const matcher = new DamerauMatcher(80);
      this.log.debug("Term Matcher: %O", matcher);

      const sources = [new WebScraper(new SamplerProcessor(), matcher)];
      this.log.debug("Loaded Sources: %O", sources);

      const searchTerm = options.search;

      this.log.info("Starting price scraping for: %s", searchTerm);

      this.printLn("");

      const spinner = ora(
        `Searching results for: ${chalk.gray(searchTerm)}`
      ).start();

      const scraper = new Scraper(sources);
      scraper
        .byName(searchTerm)
        .then((result) => {
          spinner.succeed(`Presenting results for: ${chalk.gray(searchTerm)}`);
          ResultPrinter.print(result);
        })
        .then(() => this.printLn(""))
        .catch((err) => {
          this.log.error(err.stack);
          console.log(chalk.redBright(err.message));
        })
        .finally(() => {
          const timeEnd = Date.now();
          this.log.debug(
            `Execution Time: ${(timeEnd - timeStart) / 1000} seconds`
          );

          ScraperEngine.halt()
            .then(() => this.log.debug("Scraper Engine halted successfully"))
            .catch((err) => this.log.error(`${err.message}`))
            .then(() => this.log.info("CervaJager CLI Exited"));
        });
    } catch (err) {
      this.log.error(err.stack);
      console.log(chalk.redBright(err.message));
      this.log.info("CervaJager CLI Exited with error");
    }
  }

  private printLn(text: string): void {
    console.log(chalk.blueBright(text));
  }
}

const app = new App();
app.run();
