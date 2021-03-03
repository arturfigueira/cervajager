import { DamerauMatcher } from "../../../src/core/matcher";
import samples from "./sample.json";

const matcher = new DamerauMatcher();

describe("DamerauMatcher", () => {
  describe("constructor", () => {
    describe("Invalid Inputs", () => {
      const testCases = [0, -10, 101];
      test.each(testCases)(
        "when specifying a ratio below zero or above 100, should throw an error: %p",
        (ratio: number) => {
          return expect(() => new DamerauMatcher(ratio)).toThrow();
        }
      );
    });
  });
  describe("Matches", () => {
    describe("Invalid Inputs", () => {
      const testCases = [
        ["", "Veddett"],
        ["  ", "Kwak"],
        [null, "Erdinger"],
        ["Veddett", ""],
        ["Kwak", "  "],
        ["Erdinger", null],
        ["", ""],
        [null, null],
        ["  ", "  "],
      ];
      test.each(testCases)(
        "When any arguments are empty or null, it should not match. Ex: A: %p, B: %p",
        (termA: string, termB: string) => {
          //when
          const result = matcher.matches(termA, termB);

          //then
          return expect(result).toBe(false);
        }
      );
    });

    describe("Happy Path", () => {
      const textCaseSamples = samples[0]["text-case"];
      test.each(textCaseSamples)(
        "It should match regardless text case: %p",
        (beerName: string) => {
          //when
          const matched = matcher.matches(beerName, samples[0].beer);

          //then
          return expect(matched).toBe(true);
        }
      );
      const containerSamples = samples[0].container;
      test.each(containerSamples)(
        "It should match regardless the container: %p",
        (beerName: string) => {
          //when
          const matched = matcher.matches(samples[0].beer, beerName);

          //then
          return expect(matched).toBe(true);
        }
      );
      //
      it("when the only differences are white-spaces, it should match", () => {
        //when
        const matched = matcher.matches(
          "  Pilsner    Urquell    500ml ",
          "Pilsner Urquell 500ml"
        );

        //then
        return expect(matched).toBe(true);
      });
      it("When the differences are just words permutations, it should match", () => {
        //when
        const matched = matcher.matches(
          "Westmalle Dubel 330ml",
          "Dubel 330ml Westmalle"
        );

        //then
        return expect(matched).toBe(true);
      });
      it("When beer names are totally different, It should not match", () => {
        //when
        const matched = matcher.matches(
          "Westmalle Dubel 330ml",
          "Pilsner Urquell 500ml"
        );

        //then
        return expect(matched).toBe(false);
      });
    });
  });
});
