import { isBlank } from "./utilities";

//TODO This is approach is too naive, evolve it to a fuzzy name matching
export class NameMatcher {
  private termRegexp;
  constructor(searchTerm: string) {
    if (isBlank(searchTerm)) throw Error("Search Term must be provided");
    const volume = /(\d+ml)/gi.exec(searchTerm);

    const beerTitle = searchTerm
      .replace(/cerveja|lata|\d+ml|garrafa|artesanal/gi, "")
      .trim();

    this.termRegexp = new RegExp(
      "^.*" + beerTitle + ".*" + volume[0] + ".*$",
      "i"
    );
  }

  public matches(beerName: string): boolean {
    return isBlank(beerName) ? false : beerName.match(this.termRegexp) != null;
  }
}
