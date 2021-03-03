/**
 * Allow comparison between two String terms
 */
export interface NameMatcher {
  /**
   * Compare two string terms between each other, returning weather
   * they can be considered a match or not.
   * @param termA First term
   * @param termB Second term
   * @returns True if given terms matches, false otherwise
   */
  matches(termA: string, termB: string): boolean;
}
