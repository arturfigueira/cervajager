import { isBlank } from "../utilities";
import * as _ from "lodash";
import damerauLevenshtein from "talisman/metrics/damerau-levenshtein";
import { NameMatcher } from "./nameMatcher";
import { TermProcessor } from "./termProcessor";

/**
 * Name Matcher based on Damerau-Levensthein distance algorithm to calculate
 * term matching.
 *
 * Refer the url for more info: https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance
 *
 * This is roughly based on fuzzballjs (https://github.com/nol13/fuzzball.js.git)
 * and fuzzywuzzy (https://github.com/seatgeek/fuzzywuzzy)
 */
export class DamerauMatcher implements NameMatcher {
  private _processor: TermProcessor = null;

  /**
   * Creates a new Matcher which will use Damerau-Levensthein to calculate term matching
   * @param minRatio Optional. Minimal matcher ratio. If not provided a 95% ratio will be
   * automatically setup as the minimal ratio.
   * @throws If the specified ratio is below zero (0) or above 100
   */
  constructor(private minRatio = 95) {
    if (minRatio <= 0 || minRatio > 100) {
      throw new Error("Minimal Ratio must be between 0 and 100");
    }
  }

  /**
   * Calculate a ration of similarity, between both beer names and
   * decides, based on {@var minRatio}, if they can be considered
   * a match or not.
   *
   * If any of the beer names is empty or null, the match will be considered
   * false.
   *
   * @param beerNameA First Beer Name
   * @param beerNameB Second Beer Name
   * @returns True if the ratio of similarity is above the minimal ratio
   */
  public matches(beerNameA: string, beerNameB: string): boolean {
    return isBlank(beerNameA) || isBlank(beerNameB)
      ? false
      : this.calculateRatio(beerNameA, beerNameB) >= this.minRatio;
  }

  protected termProcessor(): TermProcessor {
    if (!this._processor) {
      this._processor = new TermProcessor();
    }
    return this._processor;
  }

  protected calculateRatio(beerNameA: string, beerNameB: string): number {
    const termA = this.termProcessor().process(beerNameA);
    const termB = this.termProcessor().process(beerNameB);

    let ratio = 0;

    if (termA.length != 0 && termB.length != 0) {
      const levenDistance = damerauLevenshtein(termA, termB);
      const termLengthSum = _.toArray(termA).length + _.toArray(termB).length;

      ratio = Math.round(
        (100 * (termLengthSum - levenDistance)) / termLengthSum
      );
    }

    return ratio;
  }
}
