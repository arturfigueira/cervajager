import exclusions from "./exclusions.json";
import dictionary from "./dictionary.json";
import * as diacritics from "diacritics";

/**
 * Term Processor has the responsibility to sanitize any given beer name term,
 * removing any unnecessary information, that may slow or give false positives
 * to {@link NameMatcher}
 */
export class TermProcessor {
  private vessels = exclusions.vessel.join("|");
  private categories = exclusions.categories.join("|");
  private nationalities = exclusions.nationalities.join("|");
  private dictionary = dictionary.abbreviations;

  /**
   * Clear any ASCII, non-alphanumeric from the given term.
   * It will also try to resolve abbreviations, remove unwanted data,
   * such as beer categories, vessel and nationality.
   *
   * The idea is just leave the Brewery, beer name and the volume.
   * @param term Beer term string to be processed
   * @returns processed string without unnecessary data
   */
  public process(term: string): string {
    const termWords = diacritics
      .remove(term)
      .toLowerCase()
      .replace(this.unnecessaryTerms(), "")
      .replace(/_|-/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/(\d+)\s?litro(s?)/g, "$1l")
      .replace(/(\d+)\s?mililitros/g, "$1ml")
      .split(" ");

    return this.revertAbbreviations(termWords).sort().join(" ").trim();
  }

  private unnecessaryTerms(): RegExp {
    return new RegExp(
      `${this.vessels}|${this.categories}|${this.nationalities}`,
      "g"
    );
  }

  //FIXME might not be the best solution out there
  private revertAbbreviations(termWords: string[]): string[] {
    return termWords.map((el) => {
      const tEl = el.toLowerCase().trim();
      const dict = this.dictionary.find(
        (abv) => abv.abbreviation.trim().toLowerCase() == tEl
      );
      return dict ? dict["full-form"].toLowerCase() : tEl;
    });
  }
}
