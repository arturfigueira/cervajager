import { NameMatcher } from "../../src/core/nameMatcher";

describe("NameMatcher", () => {
  describe("Matches", () => {
    describe("Invalid Inputs", () => {
      const testCases = ["", "  ", null, undefined];
      test.each(testCases)(
        "When the given beer name is %p, it should not match",
        (beerName: string) => {
          //given
          const matcher = new NameMatcher("Brewdog Punk IPA 350ml");

          //when
          const result = matcher.matches(beerName);

          //then
          return expect(result).toBe(false);
        }
      );
    });

    describe("Happy Path", () => {
      const testCases = [
        "Brewdog Punk IPA Lata 350ml",
        "Lata Brewdog Punk IPA 350ml",
        "Garrafa Brewdog Punk IPA 350ml",
        "Brewdog Punk IPA 350ml Garrafa",
        "Brewdog Punk IPA 350ml lata",
      ];
      test.each(testCases)(
        "When matching, it should match regardless the container: %p",
        (beerName: string) => {
          //given
          const matcher = new NameMatcher("Brewdog Punk IPA 350ml");

          //when
          const matched = matcher.matches(beerName);

          //then
          return expect(matched).toBe(true);
        }
      );
    });

    describe("Happy Path", () => {
      const testCases = [
        "BREWDOG Punk IPA Lata 350ml",
        "Lata Brewdog PUNK IPA 350ml",
        "Garrafa Brewdog Punk iPa 350ml",
        "Brewdog Punk IPA 350ML Garrafa",
        "Brewdog Punk IPA 350ml LATA",
        "BREWDOG PUNK IPA 350ML",
      ];
      test.each(testCases)(
        "When matching, it should match regardless text case: %p",
        (beerName: string) => {
          //given
          const matcher = new NameMatcher("Brewdog Punk IPA 350ml");

          //when
          const matched = matcher.matches(beerName);

          //then
          return expect(matched).toBe(true);
        }
      );
      it("When matching, it should not match when beer names are different", () => {
        //given
        const matcher = new NameMatcher("Westmalle Triple 330ml");

        //when
        const matched = matcher.matches("Westmalle Dubel 330ml");

        //then
        return expect(matched).toBe(false);
      });
    });
  });
});
